// main.go
package main

import (
	"backend-webUE/api"
	"backend-webUE/config"
	"backend-webUE/database"
	"backend-webUE/models"
	"backend-webUE/router"
	"backend-webUE/services"
	"backend-webUE/utils"
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {

	// Load configuration
	mongoConfig, serverConfig, appConfig := config.LoadConfig()

	// Connect to MongoDB
	db, err := database.Connect(mongoConfig)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err = db.Client().Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()

	// Initialize OperatorConfig
	operatorConfig := &utils.OperatorConfig{
		PlmnId: models.PlmnId{
			Mcc: "208",
			Mnc: "93",
		},
		Amf: "8000",
		UeConfiguredNssai: []models.Snssai{
			{
				Sst: 1,
				Sd:  "010203",
			},
		},
		UeDefaultNssai: []models.Snssai{
			{
				Sst: 1,
				Sd:  "010203",
			},
		},
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
		Integrity: models.Integrity{
			IA1: true,
			IA2: true,
			IA3: true,
		},
		Ciphering: models.Ciphering{
			EA1: true,
			EA2: true,
			EA3: true,
		},
		UacAic: models.UacAic{
			Mps: false,
			Mcs: false,
		},
		UacAcc: models.UacAcc{
			NormalClass: 0,
			Class11:     false,
			Class12:     false,
			Class13:     false,
			Class14:     false,
			Class15:     false,
		},
		IntegrityMaxRate: models.IntegrityMaxRate{
			Uplink:   "full",
			Downlink: "full",
		},
	}

	// Create Operator
	operator := utils.NewOperator(operatorConfig)

	// Initialize Services
	ueProfileService := services.NewUeProfileService(db, operator)
	userService := services.NewUserService(db)

	// Initialize API Handlers
	ueProfileAPI := api.NewUeProfileAPI(ueProfileService)
	userAPI := api.NewUserAPI(userService, appConfig.JWTSecret)

	// Initialize Router with CORS configuration
	router := router.SetupRouter(ueProfileAPI, userAPI, userService, serverConfig, appConfig.JWTSecret)

	// Create Unique Index on 'supi' field to prevent duplicates
	createUniqueIndex(db)

	// Run the server
	err = router.Run(fmt.Sprintf(":%d", serverConfig.Port))
	if err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
	fmt.Println("JWT Secret in main.go:", appConfig.JWTSecret)
}

// createUniqueIndex ensures that the 'supi' field in 'ue_profiles' collection is unique
func createUniqueIndex(db *mongo.Database) {
	collection := db.Collection("ue_profiles")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := mongo.IndexModel{
		Keys:    bson.M{"supi": 1}, // index in ascending order
		Options: options.Index().SetUnique(true),
	}

	_, err := collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Fatalf("Failed to create unique index on 'supi': %v", err)
	} else {
		log.Println("Successfully created unique index on 'supi'")
	}
}
