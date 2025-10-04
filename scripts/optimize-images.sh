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

INPUT_DIR=${1:-photos} # Default to photos/ if not specified
QUALITY=${2:-85} # Default to 85 if not specified

if [ ! -d "$INPUT_DIR" ]; then
    echo "Input directory '$INPUT_DIR' not found."
    exit
fi

OUTPUT_DIR="${INPUT_DIR}/optimized"

mkdir -p "$OUTPUT_DIR"

for image in "$INPUT_DIR"/*.{jpg,jpeg,png,heic,HEIC,JPG,JPEG,PNG}
do
    if [ -f "$image" ]; then
        filename=$(basename -- "$image")
        filename_no_ext="${filename%.*}"

        echo "Optimizing $image..."

        magick "$image" -resize 1200x -quality "$QUALITY" "$OUTPUT_DIR/$filename_no_ext.jpg"
    fi
done

echo "Optimization complete. Optimized images are in the '$OUTPUT_DIR' directory."