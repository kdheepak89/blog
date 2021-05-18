
@time using Statistics
@time using PyPlot

function f(x, n)
    (x == 0 || n == 0) && return 0
    1 + f(x - 1, n) + f(x - 1, n - 1)
end

function main(X, N)

    arr = Matrix{Int}(undef, X, N)

    for x in 1:X
        for n in 1:N
            arr[x, n] = f(x, n)
        end
    end

    PyPlot.rc("font", size = 15)

    fig = figure(figsize = (15, 15))
    ax = subplot(221)

    for x in 1:X
        plot(1:N, arr[x, :])
    end

    ax.set_xlim(1, N)
    ax.set_xticks(1:N)
    ax.set_xlabel("Number of eggs")
    ax.set_ylabel("Number of floors (linear)")

    ax = subplot(222)

    for x in 1:X
        plot(1:N, arr[x, :])
    end

    yscale("log")

    ax.set_xlim(1, N)
    ax.set_xticks(1:N)

    ax.set_xlabel("Number of eggs")
    ax.set_ylabel("Number of floors (log)")

    ax = subplot(223)

    for n in 1:N
        plot(1:X, arr[:, n])
    end

    ax.set_xlim(1, X)
    ax.set_xticks(1:X)

    ax.set_xlabel("Number of drops")
    ax.set_ylabel("Number of floors (linear)")

    ax = subplot(224)

    for n in 1:N
        plot(1:X, arr[:, n])
    end

    yscale("log")

    ax.set_xlim(1, X)
    ax.set_xticks(1:X)

    ax.set_xlabel("Number of drops")
    ax.set_ylabel("Number of floors (log)")

    PyPlot.savefig(joinpath(@__DIR__, "./../images/egg-puzzle.png"), transparent = true)

    arr
end

main(15, 15)
