// services/ue_profile.go
package services

import (
	"backend-webUE/models"
	"backend-webUE/utils"
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// UeProfileService provides methods to interact with UE Profiles in the database
type UeProfileService struct {
	collection *mongo.Collection
	operator   *utils.Operator
}

// NewUeProfileService creates a new UeProfileService
func NewUeProfileService(db *mongo.Database, operator *utils.Operator) *UeProfileService {
	return &UeProfileService{
		collection: db.Collection("ue_profiles"),
		operator:   operator,
	}
}

// InsertUEProfile inserts a single UE Profile into the database
func (s *UeProfileService) InsertUEProfile(ue *models.UeProfile) error {
	_, err := s.collection.InsertOne(context.Background(), ue)
	if err != nil {
		log.Printf("Error inserting UE Profile: %v", err)
		return err
	}
	return nil
}

// InsertUEProfiles inserts multiple UE Profiles into the database
func (s *UeProfileService) InsertUEProfiles(profiles []models.UeProfile) error {
	var docs []interface{}
	for _, profile := range profiles {
		docs = append(docs, profile)
	}
	_, err := s.collection.InsertMany(context.Background(), docs)
	if err != nil {
		log.Printf("Error inserting multiple UE Profiles: %v", err)
		return err
	}
	return nil
}

// GetAllUEProfiles retrieves all UE Profiles from the database
func (s *UeProfileService) GetAllUEProfiles() ([]models.UeProfile, error) {
	cursor, err := s.collection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Printf("Error fetching UE Profiles: %v", err)
		return nil, err
	}
	defer cursor.Close(context.Background())

	var profiles []models.UeProfile
	for cursor.Next(context.Background()) {
		var profile models.UeProfile
		if err := cursor.Decode(&profile); err != nil {
			log.Printf("Error decoding UE Profile: %v", err)
			return nil, err
		}
		profiles = append(profiles, profile)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		return nil, err
	}

	return profiles, nil
}

// UpdateUeProfile updates an existing UE Profile based on SUPI
func (s *UeProfileService) UpdateUeProfile(supi string, ue *models.UeProfile) error {
	// Ensure that supi is not overwritten
	ue.Supi = supi

	update := bson.M{
		"$set": ue,
	}

	result, err := s.collection.UpdateOne(context.Background(), bson.M{"supi": supi}, update)
	if err != nil {
		log.Printf("Error updating UE Profile: %v", err)
		return err
	}

	if result.MatchedCount == 0 {
		log.Printf("No UE Profile found with SUPI: %s", supi)
		return mongo.ErrNoDocuments
	}

	return nil
}

// DeleteUeProfile deletes a UE Profile based on SUPI
func (s *UeProfileService) DeleteUeProfile(supi string) error {
	result, err := s.collection.DeleteOne(context.Background(), bson.M{"supi": supi})
	if err != nil {
		log.Printf("Error deleting UE Profile: %v", err)
		return err
	}

	if result.DeletedCount == 0 {
		log.Printf("No UE Profile found with SUPI: %s", supi)
		return mongo.ErrNoDocuments
	}

	return nil
}
