package services

import (
	"backend-webUE/models"
	"backend-webUE/utils"
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UeProfileService struct {
	db       *mongo.Database
	operator *utils.Operator
}

func NewUeProfileService(db *mongo.Database, operator *utils.Operator) *UeProfileService {
	return &UeProfileService{
		db:       db,
		operator: operator,
	}
}

// GenerateUeProfiles generates and inserts multiple UE profiles into the database
func (s *UeProfileService) GenerateUeProfiles(ctx context.Context, userID primitive.ObjectID, num int) ([]models.UeProfile, error) {
	collection := s.db.Collection("ue_profiles")

	var ueProfiles []models.UeProfile
	var docs []interface{}

	for i := 0; i < num; i++ {
		ueProfile := s.operator.GenerateUe()
		if ueProfile == nil {
			// Skip invalid UE profiles
			continue
		}
		ueProfile.UserID = userID // Assign the user ID

		ueProfiles = append(ueProfiles, *ueProfile)
		docs = append(docs, ueProfile)
	}

	// Check if no valid UE profiles were generated
	if len(docs) == 0 {
		return nil, fmt.Errorf("no valid UE profiles were generated")
	}

	// Use InsertMany for batch insertion
	_, err := collection.InsertMany(ctx, docs)
	if err != nil {
		return nil, fmt.Errorf("failed to insert UE profiles: %v", err)
	}
	return ueProfiles, nil
}

// CreateUeProfiles inserts multiple UE profiles into the database
func (s *UeProfileService) CreateUeProfiles(ctx context.Context, userID primitive.ObjectID, ueProfiles []models.UeProfile) error {
	collection := s.db.Collection("ue_profiles")

	// Assign userID to each profile
	for i := range ueProfiles {
		ueProfiles[i].UserID = userID
	}

	// Convert to interface slice
	var docs []interface{}
	for _, profile := range ueProfiles {
		docs = append(docs, profile)
	}

	// Use InsertMany for batch insertion
	_, err := collection.InsertMany(ctx, docs)
	if err != nil {
		return fmt.Errorf("failed to insert UE profiles: %v", err)
	}
	return nil
}

func (s *UeProfileService) GetUeProfiles(ctx context.Context, userID primitive.ObjectID) ([]models.UeProfile, error) {
	collection := s.db.Collection("ue_profiles")

	// Filter by UserID
	filter := bson.M{"userId": userID}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get UE profiles: %v", err)
	}
	defer cursor.Close(ctx)

	var ueProfiles []models.UeProfile
	if err = cursor.All(ctx, &ueProfiles); err != nil {
		return nil, fmt.Errorf("failed to decode UE profiles: %v", err)
	}
	return ueProfiles, nil
}

// GetUeProfile retrieves a specific UE profile by SUPI
func (s *UeProfileService) GetUeProfile(ctx context.Context, userID primitive.ObjectID, supi string) (*models.UeProfile, error) {
	collection := s.db.Collection("ue_profiles")

	// Filter by UserID and SUPI
	filter := bson.M{
		"userId": userID,
		"supi":   supi,
	}
	var ueProfile models.UeProfile
	err := collection.FindOne(ctx, filter).Decode(&ueProfile)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get UE profile: %v", err)
	}
	return &ueProfile, nil
}

// UpdateUeProfile updates an existing UE profile
func (s *UeProfileService) UpdateUeProfile(ctx context.Context, userID primitive.ObjectID, supi string, updatedFields map[string]interface{}) error {
	collection := s.db.Collection("ue_profiles")

	// Ensure UserID matches
	filter := bson.M{
		"userId": userID,
		"supi":   supi,
	}

	// Perform the update
	result, err := collection.UpdateOne(ctx, filter, bson.M{"$set": updatedFields})
	if err != nil {
		return fmt.Errorf("failed to update UE profile: %v", err)
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("UE profile not found")
	}
	return nil
}

// DeleteUeProfile deletes a UE profile
func (s *UeProfileService) DeleteUeProfile(ctx context.Context, userID primitive.ObjectID, supi string) error {
	collection := s.db.Collection("ue_profiles")

	// Ensure UserID matches
	filter := bson.M{
		"userId": userID,
		"supi":   supi,
	}
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to delete UE profile: %v", err)
	}
	if result.DeletedCount == 0 {
		return fmt.Errorf("UE profile not found")
	}
	return nil
}
