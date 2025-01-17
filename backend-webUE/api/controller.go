// api/controller.go
package api

import (
	"backend-webUE/models"
	"backend-webUE/services"
	"backend-webUE/utils"
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// UeProfileAPI handles UE Profile related requests
type UeProfileAPI struct {
	service *services.UeProfileService
}

// NewUeProfileAPI creates a new UeProfileAPI
func NewUeProfileAPI(service *services.UeProfileService) *UeProfileAPI {
	return &UeProfileAPI{
		service: service,
	}
}

// RegisterRoutes registers UE Profile routes
func (api *UeProfileAPI) RegisterRoutes(rg *gin.RouterGroup) {
	ueProfiles := rg.Group("/ue_profiles")
	{
		ueProfiles.GET("", api.GetAllUeProfiles)
		ueProfiles.PUT("/:supi", api.UpdateUeProfile)
		ueProfiles.DELETE("/:supi", api.DeleteUeProfile)
		ueProfiles.POST("/generate", api.GenerateUeProfiles)
	}
}

// GetAllUeProfiles retrieves all UE Profiles
func (api *UeProfileAPI) GetAllUeProfiles(c *gin.Context) {
	profiles, err := api.service.GetAllUEProfiles()
	if err != nil {
		log.Printf("Error fetching UE Profiles: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch UE Profiles"})
		return
	}
	c.JSON(http.StatusOK, profiles)
}

// UpdateUeProfile updates an existing UE Profile based on SUPI
func (api *UeProfileAPI) UpdateUeProfile(c *gin.Context) {
	supi := c.Param("supi")
	var ueProfile models.UeProfile
	if err := c.ShouldBindJSON(&ueProfile); err != nil {
		log.Printf("Invalid UE Profile input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Ensure the SUPI in the URL matches the SUPI in the body (if provided)
	if ueProfile.Supi != "" && ueProfile.Supi != supi {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Supi in URL and body do not match"})
		return
	}

	// Preserve the supi from the URL
	ueProfile.Supi = supi

	// Log the updated UE Profile for debugging
	log.Printf("Updating UE Profile: %+v", ueProfile)

	// Update in database
	if err := api.service.UpdateUeProfile(supi, &ueProfile); err != nil {
		log.Printf("Failed to update UE Profile: %v", err)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "UE Profile not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update UE Profile"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "UE Profile updated successfully"})
}

// DeleteUeProfile deletes a UE Profile
func (api *UeProfileAPI) DeleteUeProfile(c *gin.Context) {
	supi := c.Param("supi")
	if err := api.service.DeleteUeProfile(supi); err != nil {
		log.Printf("Failed to delete UE Profile: %v", err)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "UE Profile not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete UE Profile"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "UE Profile deleted successfully"})
}

// GenerateUeProfiles generates multiple UE Profiles based on input parameters
func (api *UeProfileAPI) GenerateUeProfiles(c *gin.Context) {
	var formData struct {
		NumUes            int              `json:"num_ues" binding:"required,min=1"`
		Plmnid            models.PlmnId    `json:"plmnid" binding:"required"`
		UeConfiguredNssai []models.Snssai  `json:"ueConfiguredNssai" binding:"required,dive,required"`
		UeDefaultNssai    []models.Snssai  `json:"ueDefaultNssai" binding:"required,dive,required"`
		Integrity         models.Integrity `json:"integrity" binding:"required"`
		Ciphering         models.Ciphering `json:"ciphering" binding:"required"`
		UacAic            models.UacAic    `json:"uacAic" binding:"required"`
		UacAcc            models.UacAcc    `json:"uacAcc" binding:"required"`
	}

	// Bind JSON input
	if err := c.ShouldBindJSON(&formData); err != nil {
		log.Printf("Invalid input for UE Profile generation: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Create OperatorConfig based on the received data
	newOperatorConfig := &utils.OperatorConfig{
		PlmnId:            formData.Plmnid,
		UeConfiguredNssai: formData.UeConfiguredNssai,
		UeDefaultNssai:    formData.UeDefaultNssai,
		Integrity:         formData.Integrity,
		Ciphering:         formData.Ciphering,
		UacAic:            formData.UacAic,
		UacAcc:            formData.UacAcc,
		Profiles: []models.Profile{
			{
				Scheme:     1,
				PrivateKey: "c53c22208b61860b06c62e5406a7b330c2b577aa5558981510d128247d38bd1d",
				PublicKey:  "5a8d38864820197c3394b92613b20b91633cbd897119273bf8e4a6f4eec0a650",
			},
			{
				Scheme:     2,
				PrivateKey: "F1AB1074477EBCC7F554EA1C5FC368B1616730155E0041AC447D6301975FECDA",
				PublicKey:  "0272DA71976234CE833A6907425867B82E074D44EF907DFB4B3E21C1C2256EBCD1",
			},
		},
		GnbSearchList: []string{"10.0.0.2"},
		Amf:           "8000",

		Sessions: []models.Sessions{
			{
				Type: "IPv4",
				Apn:  "internet",
				Slice: models.Snssai{
					Sst: 1,
					Sd:  "0x010203",
				},
			},
		},
		IntegrityMaxRate: models.IntegrityMaxRate{
			Uplink:   "full",
			Downlink: "full",
		},
	}

	// Create a new Operator with the new configuration
	newOperator := utils.NewOperator(newOperatorConfig)
	if newOperator == nil {
		log.Printf("Failed to create operator with provided configuration")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create operator"})
		return
	}

	// Generate UE profiles
	generatedProfiles := []models.UeProfile{}
	for i := 0; i < formData.NumUes; i++ {
		ueProfile, err := newOperator.GenerateUe()
		if err != nil {
			log.Printf("Error generating UE Profile: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate UE Profile"})
			return
		}
		if ueProfile != nil {
			generatedProfiles = append(generatedProfiles, *ueProfile)
		}
	}

	if len(generatedProfiles) == 0 {
		log.Printf("No UE Profiles generated")
		c.JSON(http.StatusBadRequest, gin.H{"error": "No UE Profiles generated"})
		return
	}

	// Insert generated profiles into MongoDB
	if err := api.service.InsertUEProfiles(generatedProfiles); err != nil {
		log.Printf("Failed to insert UE Profiles into MongoDB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save UE Profiles to database"})
		return
	}

	// Export to YAML files
	yamlFiles := []string{}
	for _, ue := range generatedProfiles {
		filename := fmt.Sprintf("ue_profile_%s.yaml", ue.Supi)
		filePath := filepath.Join("output", filename)
		err := utils.ExportYAML(filePath, ue)
		if err != nil {
			log.Printf("Failed to export UE Profile to YAML: %v", err)
			// Continue exporting other profiles even if one fails
			continue
		}
		yamlFiles = append(yamlFiles, filePath)
	}

	// Respond to frontend
	c.JSON(http.StatusOK, gin.H{
		"message":    "UE Profiles generated and saved successfully",
		"profiles":   generatedProfiles,
		"yaml_files": yamlFiles,
	})
}
