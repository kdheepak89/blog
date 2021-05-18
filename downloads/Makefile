## Put this Makefile in your project directory---i.e., the directory
## containing the paper you are writing. Assuming you are using the
## rest of the toolchain here, you can use it to create .html, .tex,
## and .pdf output files (complete with bibliography, if present) from
## your markdown file.
## -	Change the paths at the top of the file as needed.
## -	Using `make` without arguments will generate html, tex, and pdf
## 	output files from all of the files with the designated markdown
##	extension. The default is `.md` but you can change this.
## -	You can specify an output format with `make tex`, `make pdf` or
## - 	`make html`.
## -	Doing `make clean` will remove all the .tex, .html, and .pdf files
## 	in your working directory. Make sure you do not have files in these
##	formats that you want to keep!

## Location of your working bibliography file
SCRIPTS = ./../scripts

MARKDOWN = ./23-technical-writing

MARKDOWNFOLDER = ./..

OUTPUT = ./downloads

OUTPUTFILE = writing-papers-with-markdown

all: setup ieeepdf ieeedocx ieeehtml pdf docx html slidespdf

setup:
	cp IEEETran.cls $(MARKDOWNFOLDER)/

ieeepdf:
	cd .. && pandoc -r markdown+smart+table_captions+yaml_metadata_block -s --pdf-engine=pdflatex --template=$(OUTPUT)/ieee.template --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -o $(OUTPUT)/$(OUTPUTFILE).ieee.pdf $(MARKDOWN).md --metadata link-citations=true

ieeetex:
	cd .. && pandoc -r markdown+smart+table_captions+yaml_metadata_block -s --pdf-engine=pdflatex --template=$(OUTPUT)/ieee.template --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -o $(OUTPUT)/$(OUTPUTFILE).ieee.tex $(MARKDOWN).md --metadata link-citations=true


ieeedocx:
	cd .. && pandoc -r markdown+smart+table_captions+yaml_metadata_block -s --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib --reference-doc=$(OUTPUT)/trans_jour.docx  -o $(OUTPUT)/$(OUTPUTFILE).ieee.docx $(MARKDOWN).md --metadata link-citations=true

ieeehtml:
	cd .. && pandoc --mathjax -r markdown+smart+table_captions+yaml_metadata_block -s -w html --template=$(OUTPUT)/ieeehtml.template --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -o $(OUTPUT)/$(OUTPUTFILE).ieee.html $(MARKDOWN).md --metadata link-citations=true -c https://cdn.rawgit.com/thomaspark/pubcss/549f945ffeff64f1929011785adf1c8e75264058/formats/acm-sig/css/pub.css

pdf:
	cd .. && pandoc -r markdown+smart+table_captions+yaml_metadata_block -s --pdf-engine=pdflatex --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --filter $(SCRIPTS)/remove_ieeekeywords.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -o $(OUTPUT)/$(OUTPUTFILE).pdf $(MARKDOWN).md --metadata link-citations=true

docx:
	cd .. && pandoc -r markdown+smart+table_captions+yaml_metadata_block -s --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -o $(OUTPUT)/$(OUTPUTFILE).docx $(MARKDOWN).md --metadata link-citations=true

html:
	cd .. && pandoc --mathjax -r markdown+smart+table_captions+yaml_metadata_block -s -w html --filter pandoc-fignos --filter pandoc-eqnos --filter pandoc-tablenos --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -o $(OUTPUT)/$(OUTPUTFILE).html $(MARKDOWN).md --metadata link-citations=true -c https://cdn.rawgit.com/claymcleod/pandoc-academic-publication/ce07fa7a20af53cab8c8a50c5bad5ad15d726bba/assets/css/academic-pub.css

slidespdf:
	cd .. && pandoc -r markdown+smart+table_captions+yaml_metadata_block -s --pdf-engine=pdflatex --filter $(SCRIPTS)/slides.py --filter pandoc-citeproc --filter $(SCRIPTS)/fix-latex-symbol.py --csl=$(OUTPUT)/ieee.csl --bibliography=blog.bib -t beamer -o $(OUTPUT)/$(OUTPUTFILE).slides.pdf $(MARKDOWN).md --metadata link-citations=true

slideshtml:
	pandoc -t html5 --template=default.revealjs \
	--mathjax -r markdown+smart+table_captions+yaml_metadata_block \
	--filter $(SCRIPTS)/slides.py \
	--filter pandoc-citeproc --filter $(SCRIPTS)/remove_ieeekeywords.py \
	--csl=$(OUTPUT)/ieee.csl --bibliography=$(MARKDOWNFOLDER)/blog.bib \
	--standalone --section-divs \
	--variable reveal-url=/../reveal.js \
	--variable theme="white" \
	--variable transition="linear" $(MARKDOWN).md -o $(OUTPUT)/$(OUTPUTFILE).slides.html

clean:
	rm -f *.html *.pdf *.tex *.aux *.log *.dvi *.docx *.out
