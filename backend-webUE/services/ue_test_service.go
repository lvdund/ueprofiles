package services

import (
	"backend-webUE/models"
	"backend-webUE/utils"
	"os"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestExportYAML(t *testing.T) {
	ueProfile := models.UeProfile{
		ID:    primitive.NewObjectID(),
		Supi:  "imsi-001001000000001",
		Key:   "some-key",
		Amf:   "some-amf",
		Op:    "some-op",
		Imei:  "some-imei",
		Imeisv: "some-imeisv",
	}

	filename := "./uegen/test.yaml"
	defer os.Remove(filename) // Clean up after test

	err := utils.ExportYAML(filename, ueProfile)
	if err != nil {
		t.Fatalf("Failed to export YAML: %v", err)
	}

	// Verify file exists
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		t.Fatalf("YAML file was not created: %v", err)
	}
}
