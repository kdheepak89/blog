---
title: Advent of Code 2020 Retrospective
category: blog
date: 2020-12-25T20:01:58-07:00
tags: adventofcode, julia
keywords: adventofcode, julia
summary:
---

It is Christmas night, and it is the first time this month that I haven't planned had to plan schedule for the evening around a programming puzzle contest.
I participated in [Advent of Code 2020](https://adventofcode.com/2020/) this year, and I managed to collect all fifty stars!

![](images/advent-of-code-2020-stars.png)

I did all the puzzles in [Julia](https://julialang.org/) this year, and my solutions are available [here](https://github.com/kdheepak/adventofcode/tree/master/2020/julia/src).

# Why you should participate in Advent of Code

Advent of Code is a lot of fun.
I think there's a few reasons I find it quite enjoyable.

Firstly, there's the competitive aspect of it.

A single puzzle unlocks every night at midnight Eastern Time, and your time when you submit a solution is recorded.
There's a global leaderboard that highlights the top 100 fastest times.
And you also have the ability to make a private leaderboard that you can share with anyone you like, and you can use that to track your time and challenge your friends / peers.
For straightforward puzzles, it is a lot of fun to see who can read, grok and type out a bug-free working program the fastest.
There are a bunch of people that upload recordings of their attempts and it is humbling to see how fast they can churn out a correct solution to a problem.

Secondly, unlike most other competitive programming challenges, the puzzles are mainly designed to be a teaching / learning experience.

Every puzzle has two parts, where the first part introduces a prompt, and requires you to solve it before viewing the second part.
The first part tends to set up an idea or check that you are on the right track, and the second part tends to extend the idea or subvert an obvious decision you made in the first part.

There's a lot of "ah ha" moments when you figure something out.

Most problems are standard computer science programming problems, but are never presented as such.
Some problems have a mathematics tilt to it, which can make finding such solutions very satisfying.
But also, every problem is designed such that even if you don't know the "theory" behind it you'll be able to solve it.
And when you do, reading other people's one liners is quite enlightening.

Almost all the problems require parsing text input of various formats.
And since various programming language communities discuss their solutions in dedicated forums, there tends to be a lot of discussions about the tips and tricks in your favourite programming language that you could use to express the problem more elegantly.
Even after having used Python and Julia for years now, I still learn new things about these programming languages when I read other people's solutions.

And finally, the community.

The [/r/adventofcode](reddit.com/r/adventofcode) subreddit and the Julia Zulip and Slack channel have been a joy to visit every day after solving the puzzles.
I particularly enjoyed seeing all the neat visualizations that come out of Advent of Code by the community.

If you've never heard of Advent of Code, I highly recommend you try it out.
Below I'll be discussing solutions from solving this year's Advent of Code, which will contain spoilers.

# Solutions

## [Day 1](https://adventofcode.com/2020/day/1)

This solution can be concisely represented using the `combinations` function from the [`Combinatorics.jl`](https://github.com/JuliaMath/Combinatorics.jl):

```julia
using Combinatorics

readInput() = parse.(Int, split(strip(read(joinpath("src/day01/input.txt"), String))))

expense_report(data, n) = only(prod(items) for items in combinations(sort(data), n) if sum(items) == 2020)

part1(data = readInput()) = expense_report(data, 2)
part2(data = readInput()) = expense_report(data, 3)
```

Python has a similar function in the standard library: <https://docs.python.org/3/library/itertools.html#itertools.combinations>

## [Day 2](https://adventofcode.com/2020/day/2)

Julia supports infix operators for xor: ⊻. Solution below is based on [Sukera's](https://github.com/Seelengrab/AdventOfCode).

```julia
readInput() = split(strip(read("src/day02/input.txt", String)), '\n')

function parseInput(data)
    d = split.(data, ": ")
    map(d) do (policy,password)
        rule, letter = split(policy, ' ')
        low, high = parse.(Int, split(rule, '-'))
        (low, high, only(letter), strip(password))
    end
end

function part1(data = readInput())
    count(parseInput(data)) do (low, high, letter, password)
        low <= count(==(letter), password) <= high
    end
end

function part2(data = readInput())
    count(parseInput(data)) do (low, high, letter, password)
        (password[low] == letter) ⊻ (password[high] == letter)
    end
end
```

In Julia, you can use the `only` function to get the one and only element in a collection.

## [Day 3](https://adventofcode.com/2020/day/3)

A lot of advent of code problems have the puzzle input as text that represents a grid.
Having a one liner to convert that to a `Matrix` is very useful.
This solution is based on [Henrique Ferrolho's](https://github.com/ferrolho/advent-of-code/blob/b34dbe9ee5eef7a36fbf77044c83acc75fbe54cf/2020/03/puzzle.jl).

```julia
readInput() = permutedims(reduce(hcat, collect.(readlines("src/day03/input.txt"))))

function solve(trees, slope)
    n = cld(size(trees, 1), slope.y)
    rs = range(1, step=slope.y, length=n)
    cs = range(1, step=slope.x, length=n)
    cs = map(c -> mod1(c, size(trees, 2)), cs)
    idxs = CartesianIndex.(rs, cs)
    count(t -> t == '#', trees[idxs])
end

part1(data = readInput()) = solve(data, (x = 3, y = 1))
part2(data = readInput()) = prod(solve(data, s) for s in [
    (x = 1, y = 1),
    (x = 5, y = 1),
    (x = 3, y = 1),
    (x = 7, y = 1),
    (x = 1, y = 2),
  ])
```

Julia has `mod1` for 1 based mod, which is useful for indexing in these type of situations.
Julia also has ceiling division (`cld`) and floor division (`fld`) which happen to be handy here.

## [Day 4](https://adventofcode.com/2020/day/4)

Learning how to use regex in your programming language of choice that make solutions concise and terse.
For example, check out this terse solution by [Pablo Zubieta](https://github.com/pabloferz/AoC/blob/e64841e31d9dc9391be73b041a2e01795dafa1b6/2020/04/Day4.jl):

```julia
readInput() = split(read("src/day04/input.txt", String), "\n\n")

const fields1 = (r"byr", r"iyr", r"eyr", r"hgt", r"hcl", r"ecl", r"pid")
const fields2 = (
    r"byr:(19[2-9][0-9]|200[0-2])\b",
    r"iyr:20(1[0-9]|20)\b",
    r"eyr:20(2[0-9]|30)\b",
    r"hgt:(1([5-8][0-9]|9[0-3])cm|(59|6[0-9]|7[0-6])in)\b",
    r"hcl:#[0-9a-f]{6}\b",
    r"ecl:(amb|blu|brn|gry|grn|hzl|oth)\b",
    r"pid:\d{9}\b"
)

part1(data = readInput()) = count(p -> all(t -> contains(p, t), fields1), data)
part2(data = readInput()) = count(p -> all(t -> contains(p, t), fields2), data)
```

There were a lot of puzzles this year where I would have been able to more easily parse the input by knowing just a little bit more regex.

## [Day 5](https://adventofcode.com/2020/day/5)

Sometimes having a little insight into what the problem is asking can go a long way.
For example, in this puzzle, the seat ID is just a binary representation of the input.
So you can calculate the seat ID using binary shifting or by parsing the input as a binary number directly.
This solution is based on [Andrey Oskin's](https://github.com/Arkoniak/advent_of_code/blob/c692bc20147362cfb373e1483cf73588489a597b/2020/05/day05.jl):

```julia
seatid(s) = reduce((x, y) -> (x << 1) | ((y == 'R') | (y == 'B')), s; init = 0)
# OR
seatid(s) = parse(Int, map(c -> c ∈ ('R', 'B') ? '1' : '0', s), base = 2)

part1() = mapreduce(seatid, max, eachline("src/day05/input.txt"))

function part2()
  seats = sort(seatid.(eachline("src/day05/input.txt")))
  prev = seats[1]
  for seat in seats
    (seat - prev == 2) && return prev + 1
    prev = seat
  end
end
```

## [Day 6](https://adventofcode.com/2020/day/6)

Julia has methods on functions like `sum` that accept a function as the first argument.
Also, you can use the unicode symbols of mathematical operations for union and intersection of sets.

```julia
readInput() = split.(split(read("src/day06/input.txt", String), "\n\n"))

part1(data = readInput()) = sum(q->length(∪(Set.(q)...)), data)
part2(data = readInput()) = sum(q->length(∩(Set.(q)...)), data)
```