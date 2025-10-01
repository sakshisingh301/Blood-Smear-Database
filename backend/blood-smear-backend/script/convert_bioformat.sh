#!/bin/bash

INPUT_FILE="$1"
OUTPUT_FILE="$2"

# Use Bio-Formats command-line tools instead of the Java package
INSTALL_DIR="./bioformats"
BFTOOLS_URL="https://downloads.openmicroscopy.org/bio-formats/6.13.0/artifacts/bftools.zip"
BFTOOLS_ZIP="$INSTALL_DIR/bftools.zip"
BFTOOLS_DIR="$INSTALL_DIR/bftools"

# Step 1: Check for Java
check_java() {
  if ! command -v java &> /dev/null; then
    echo "Java not found. Installing..."
    if command -v apt &> /dev/null; then
      sudo apt update
      sudo apt install -y default-jdk
    elif command -v yum &> /dev/null; then
      sudo yum install -y java-11-openjdk-devel
    elif command -v brew &> /dev/null; then
      brew install openjdk
    else
      echo "Unsupported system. Please install Java JDK manually."
      exit 1
    fi
  fi
  echo "Java version: $(java -version 2>&1 | head -n 1)"
}

# Step 2: Download and extract Bio-Formats command-line tools
install_bftools() {
  if [ ! -d "$BFTOOLS_DIR" ]; then
    echo "Downloading Bio-Formats command-line tools..."
    mkdir -p "$INSTALL_DIR"
    
    if command -v wget &> /dev/null; then
      wget -O "$BFTOOLS_ZIP" "$BFTOOLS_URL"
    elif command -v curl &> /dev/null; then
      curl -L -o "$BFTOOLS_ZIP" "$BFTOOLS_URL"
    else
      echo "Neither wget nor curl found. Please install one of them."
      exit 1
    fi
    
    echo "Extracting Bio-Formats tools..."
    unzip -q "$BFTOOLS_ZIP" -d "$INSTALL_DIR"
    rm "$BFTOOLS_ZIP"
    
    # Make scripts executable
    chmod +x "$BFTOOLS_DIR"/*.sh
  else
    echo "Bio-Formats tools already present."
  fi
}

# Step 3: Convert using bfconvert
convert_image() {
  BFCONVERT="$BFTOOLS_DIR/bfconvert"
  
  if [ ! -f "$BFCONVERT" ]; then
    echo "bfconvert not found at $BFCONVERT"
    exit 1
  fi
  
  echo "Converting $INPUT_FILE to $OUTPUT_FILE using bfconvert..."
  
  # Run bfconvert with proper options
  "$BFCONVERT" -bigtiff -compression LZW "$INPUT_FILE" "$OUTPUT_FILE"
  
  if [ $? -eq 0 ]; then
    echo "✅ Conversion successful!"
  else
    echo "❌ Conversion failed." >&2
    echo "You can try different options:"
    echo "- Different compression: -compression JPEG-2000, -compression Uncompressed"
    echo "- Without bigtiff: remove -bigtiff option"
    echo "- Different output format: change extension to .ome.tiff"
    exit 1
  fi
}

# Validate input arguments
if [ $# -ne 2 ]; then
  echo "Usage: $0 <input_file> <output_file>"
  echo "Example: $0 input.vsi output.tiff"
  exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "Input file '$INPUT_FILE' does not exist."
  exit 1
fi

# Create output directory if it doesn't exist
OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
mkdir -p "$OUTPUT_DIR"

check_java
install_bftools
convert_image