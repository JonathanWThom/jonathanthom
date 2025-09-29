#!/bin/bash

# This script optimizes images for the web.
# It requires the 'imagemagick' library.

# --- Installation ---
# macOS (using Homebrew): brew install imagemagick
# Debian/Ubuntu: sudo apt-get install imagemagick
# --------------------

# Check if imagemagick is installed
if ! command -v convert &> /dev/null
then
    echo "imagemagick could not be found. Please install it."
    echo "macOS (using Homebrew): brew install imagemagick"
    echo "Debian/Ubuntu: sudo apt-get install imagemagick"
    exit
fi

# Check for input directory
if [ -z "$1" ]
  then
    echo "No input directory supplied. Usage: ./optimize-images.sh <directory>"
    exit
fi

INPUT_DIR=$1
OUTPUT_DIR="${INPUT_DIR}/optimized"

mkdir -p "$OUTPUT_DIR"

for image in "$INPUT_DIR"/*.{jpg,jpeg,png}
do
    if [ -f "$image" ]; then
        filename=$(basename -- "$image")
        extension="${filename##*.}"
        filename="${filename%.*}"

        echo "Optimizing $image..."

        magick "$image" -resize 1200x -quality 85 "$OUTPUT_DIR/$filename.jpg"
    fi
done

echo "Optimization complete. Optimized images are in the '$OUTPUT_DIR' directory."
