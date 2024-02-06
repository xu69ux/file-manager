# File-Manager

## Description

This is a command-line application built with Node.js. It provides a set of utilities for interacting with the file system, hashing data, compressing files, and more.

## Installation

To install the application, you'll need to have Node.js and npm installed on your machine. Once you have those, you can install the application by running:

```sh
npm install
```

## Usage

To start the application, run:

```sh
node src/app.js
```

The application will prompt you for commands. Here are the available commands:

- `ls`: Lists all files and directories in the current directory.
- `cd <directory>`: Changes the current directory to the specified directory.
- `up`: Moves up one directory level.
- `cat <path>`: Prints the contents of the file at the given path.
- `add <directory> <filename>`: Creates a new file with the given name in the specified directory.
- `rn <oldPath> <newName>`: Renames the file at `oldPath` to `newName`.
- `cp <sourcePath> <destinationDirectory>`: Copies the file from `sourcePath` to `destinationDirectory`.
- `mv <sourcePath> <destinationDirectory>`: Moves the file from `sourcePath` to `destinationDirectory`.
- `rm <path>`: Deletes the file at the given path.
- `compress <path>`: Compresses the file at the given path using the Brotli algorithm.
- `decompress <path>`: Decompresses the Brotli-compressed file at the given path.
- `hash <path>`: Calculates the hash of the file at the given path.
- `os`: Prints information about the operating system.

