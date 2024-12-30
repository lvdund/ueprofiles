package utils

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// ExportYAML writes a struct to a YAML file
func ExportYAML(filename string, data interface{}) error {
	// Ensure the directory exists
	dir := filepath.Dir(filename)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directory: %v", err)
	}

	// Open the file for writing
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %v", err)
	}
	defer file.Close()

	// Marshal the data into YAML format
	encoder := yaml.NewEncoder(file)
	defer encoder.Close()
	if err := encoder.Encode(data); err != nil {
		return fmt.Errorf("failed to write YAML: %v", err)
	}

	return nil
}
