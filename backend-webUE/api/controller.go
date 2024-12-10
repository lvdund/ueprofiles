package api

import (
	"backend-webUE/models"
	"backend-webUE/services"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UeProfileAPI struct {
	ueProfileService *services.UeProfileService
}

func NewUeProfileAPI(ueProfileService *services.UeProfileService) *UeProfileAPI {
	return &UeProfileAPI{
		ueProfileService: ueProfileService,
	}
}

func getUserID(c *gin.Context) (primitive.ObjectID, error) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		return primitive.NilObjectID, fmt.Errorf("userID not found in context")
	}
	userID, ok := userIDValue.(primitive.ObjectID)
	if !ok {
		return primitive.NilObjectID, fmt.Errorf("userID has invalid type")
	}
	return userID, nil
}

// Register Routes for UE profile API
func (api *UeProfileAPI) RegisterRoutes(router gin.IRouter) {
	router.POST("/ue_profiles/generate", api.generateUeProfiles)
	router.POST("/ue_profiles", api.createUeProfiles)
	router.GET("/ue_profiles", api.getUeProfiles)
	router.GET("/ue_profiles/:supi", api.getUeProfile)
	router.PUT("/ue_profiles/:supi", api.updateUeProfile)
	router.DELETE("/ue_profiles/:supi", api.deleteUeProfile)
}

type GenerateUeProfilesRequest struct {
	NumUes int `json:"num_ues"`
}

func (api *UeProfileAPI) generateUeProfiles(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req GenerateUeProfilesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.NumUes <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "num_ues must be greater than 0"})
		return
	}

	ueProfiles, err := api.ueProfileService.GenerateUeProfiles(c.Request.Context(), userID, req.NumUes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "UE profiles generated",
		"ue_profiles": ueProfiles,
	})
}

// Create multiple UE profiles
func (api *UeProfileAPI) createUeProfiles(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var ueProfiles []models.UeProfile
	if err := c.ShouldBindJSON(&ueProfiles); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Insert profiles for the user
	err = api.ueProfileService.CreateUeProfiles(c.Request.Context(), userID, ueProfiles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "UE profiles created"})
}

// Get a list of all UE profiles
func (api *UeProfileAPI) getUeProfiles(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ueProfiles, err := api.ueProfileService.GetUeProfiles(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ueProfiles)
}

// Get UE profile following by SUPI
func (api *UeProfileAPI) getUeProfile(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	supi := c.Param("supi")
	ueProfile, err := api.ueProfileService.GetUeProfile(c.Request.Context(), userID, supi)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if ueProfile == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "UE profile not found"})
		return
	}
	c.JSON(http.StatusOK, ueProfile)
}

// Update the info of a UE profile
func (api *UeProfileAPI) updateUeProfile(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	supi := c.Param("supi")

	// Fetch existing UE profile
	existingProfile, err := api.ueProfileService.GetUeProfile(c.Request.Context(), userID, supi)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch existing UE profile"})
		return
	}
	if existingProfile == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "UE profile not found"})
		return
	}

	// Parse the updated fields from the request body
	var updatedFields map[string]interface{}
	if err := c.ShouldBindJSON(&updatedFields); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Prevent SUPI and UserID from being updated
	if _, exists := updatedFields["supi"]; exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot update SUPI"})
		return
	}
	if _, exists := updatedFields["userId"]; exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot update userId"})
		return
	}

	// Update the UE profile
	err = api.ueProfileService.UpdateUeProfile(c.Request.Context(), userID, supi, updatedFields)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "UE profile updated successfully"})
}

// Delete an UE profile
func (api *UeProfileAPI) deleteUeProfile(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	supi := c.Param("supi")

	err = api.ueProfileService.DeleteUeProfile(c.Request.Context(), userID, supi)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "UE profile deleted"})
}
