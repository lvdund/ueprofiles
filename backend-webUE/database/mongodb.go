package database

import (
	"backend-webUE/config"
	"backend-webUE/models"
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Connect to MongoDB using configuration
func Connect(config config.MongoConfig) (*mongo.Database, error) {
	uri := fmt.Sprintf(
		"mongodb://%s:%s@%s:%d/%s?authSource=admin",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.Database,
	)
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Recheck the connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	return client.Database(config.Database), nil
}

// Insert a new UeProfile into database
func InsertUeProfile(ctx context.Context, db *mongo.Database, ueProfile models.UeProfile) error {
	collection := db.Collection("ue_profiles")
	_, err := collection.InsertOne(ctx, ueProfile)
	if err != nil {
		return fmt.Errorf("failed to insert UE profile: %v", err)
	}
	return nil
}

// Retrieve all UE profiles from the database
func GetUeProfiles(ctx context.Context, db *mongo.Database) ([]models.UeProfile, error) {
	collection := db.Collection("ue_profiles")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("fail to get UE profiles: %v", err)
	}
	defer cursor.Close(ctx)

	var ueProfiles []models.UeProfile
	if err = cursor.All(ctx, &ueProfiles); err != nil {
		return nil, fmt.Errorf("failed to decode UE profiles: %v", err)
	}
	return ueProfiles, nil
}

// Retrieve a specific UE profile from the database by SUPI
func GetUeProfile(ctx context.Context, db *mongo.Database, supi string) (*models.UeProfile, error) {
	collection := db.Collection("ue_profiles")
	var ueProfile models.UeProfile
	err := collection.FindOne(ctx, bson.M{"supi": supi}).Decode(&ueProfile)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get UE profile: %v", err)
	}
	return &ueProfile, nil
}

// Update an existing UE profile in the database
func UpdateUeProfile(ctx context.Context, db *mongo.Database, supi string, ueProfile models.UeProfile) error {
	collection := db.Collection("ue_profiles")
	result, err := collection.UpdateOne(ctx, bson.M{"supi": supi}, bson.M{"$set": ueProfile})
	if err != nil {
		return fmt.Errorf("failed to update UE profile: %v", err)
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("UE profile not found")
	}
	return nil
}

// Delete a UE profile from the database
func DeleteUeProfile(ctx context.Context, db *mongo.Database, supi string) error {
	collection := db.Collection("ue_profiles")
	result, err := collection.DeleteOne(ctx, bson.M{"supi": supi})
	if err != nil {
		return fmt.Errorf("failed to delete UE profile: %v", err)
	}
	if result.DeletedCount == 0 {
		return fmt.Errorf("UE profile not found")
	}
	return nil
}
