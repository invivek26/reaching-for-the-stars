#!/bin/bash

# Script to compile the LaTeX report for "Reaching for the Stars" project
# This script compiles the report and handles bibliography generation

echo "Compiling LaTeX report: Reaching for the Stars..."
echo "=============================================="

# Check if we're in the correct directory
if [ ! -f "reaching-for-the-stars-report.tex" ]; then
    echo "Error: reaching-for-the-stars-report.tex not found!"
    echo "Please run this script from the report directory."
    exit 1
fi

# Check if references.bib exists
if [ ! -f "references.bib" ]; then
    echo "Warning: references.bib not found! Bibliography will not be generated."
fi

echo "Step 1: First LaTeX compilation..."
pdflatex reaching-for-the-stars-report.tex

if [ $? -ne 0 ]; then
    echo "Error: First LaTeX compilation failed!"
    exit 1
fi

echo "Step 2: Generating bibliography..."
bibtex reaching-for-the-stars-report

if [ $? -ne 0 ]; then
    echo "Warning: Bibliography generation failed or no citations found."
fi

echo "Step 3: Second LaTeX compilation..."
pdflatex reaching-for-the-stars-report.tex

if [ $? -ne 0 ]; then
    echo "Error: Second LaTeX compilation failed!"
    exit 1
fi

echo "Step 4: Final LaTeX compilation..."
pdflatex reaching-for-the-stars-report.tex

if [ $? -ne 0 ]; then
    echo "Error: Final LaTeX compilation failed!"
    exit 1
fi

# Clean up auxiliary files (optional)
echo "Cleaning up auxiliary files..."
rm -f *.aux *.bbl *.blg *.log *.out *.toc *.lof *.lot

echo ""
echo "✓ Report compilation completed successfully!"
echo "✓ Output file: reaching-for-the-stars-report.pdf"
echo ""
echo "To view the PDF:"
echo "  open reaching-for-the-stars-report.pdf    # macOS"
echo "  xdg-open reaching-for-the-stars-report.pdf  # Linux"
echo "  start reaching-for-the-stars-report.pdf     # Windows"