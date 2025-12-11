#!/bin/bash

# Add a photo to the gallery
# Usage: ./scripts/add-photo.sh /path/to/photo.jpg
#
# This script:
# 1. Prompts for a description
# 2. Optimizes the image (1200px wide, 85% quality, .jpg format)
# 3. Copies to photos/optimized/
# 4. Adds the HTML to the top of the photo gallery

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OPTIMIZED_DIR="$PROJECT_DIR/photos/optimized"
HTML_FILE="$PROJECT_DIR/photos/index.html"
QUALITY=85

# Check if imagemagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: imagemagick is not installed."
    echo "Install with: brew install imagemagick"
    exit 1
fi

# Check if a file was provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/add-photo.sh /path/to/photo.jpg"
    exit 1
fi

INPUT_FILE="$1"

# Check if file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found."
    exit 1
fi

# Get the original filename (without path)
ORIGINAL_NAME=$(basename -- "$INPUT_FILE")
FILENAME_NO_EXT="${ORIGINAL_NAME%.*}"

# Output will always be .jpg
OUTPUT_NAME="${FILENAME_NO_EXT}.jpg"
OUTPUT_PATH="$OPTIMIZED_DIR/$OUTPUT_NAME"

# Check if output already exists
if [ -f "$OUTPUT_PATH" ]; then
    echo "Error: '$OUTPUT_NAME' already exists in photos/optimized/"
    echo "Remove it first or rename your input file."
    exit 1
fi

# Prompt for description
echo ""
echo "Adding photo: $ORIGINAL_NAME"
echo ""
read -p "Enter a description for this photo: " DESCRIPTION

if [ -z "$DESCRIPTION" ]; then
    echo "Error: Description cannot be empty."
    exit 1
fi

# Create optimized directory if it doesn't exist
mkdir -p "$OPTIMIZED_DIR"

# Optimize the image
echo ""
echo "Optimizing image..."
magick "$INPUT_FILE" -resize 1200x -quality "$QUALITY" "$OUTPUT_PATH"
echo "Created: photos/optimized/$OUTPUT_NAME"

# Build the HTML line (add at the top of the gallery)
# Escape special characters in description for sed
ESCAPED_DESC=$(echo "$DESCRIPTION" | sed 's/[&/\]/\\&/g')
IMG_TAG="                <img src=\"/photos/optimized/$OUTPUT_NAME\" alt=\"$ESCAPED_DESC\" tabindex=\"0\" title=\"$ESCAPED_DESC\">"

# Insert after the data-photos-container div opening tag
# We look for the first <img after data-photos-container and insert before it
sed -i '' "/<div class=\"photos\" data-photos-container>/a\\
$IMG_TAG
" "$HTML_FILE"

echo ""
echo "Done! Photo added to gallery."
echo ""
echo "Preview: $OUTPUT_PATH"
echo "HTML added to: photos/index.html"
echo ""
echo "Don't forget to commit your changes:"
echo "  git add photos/optimized/$OUTPUT_NAME photos/index.html"
echo "  git commit -m \"Add photo: $DESCRIPTION\""
