// utils/operator.go
package utils

import (
	"backend-webUE/models"
	"backend-webUE/supi-key" // Ensure this import is correct
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"strings"
	"time"
)

// Constants
const (
	IMSI_TYPE   = 0
	NAI_TYPE    = 1
	SUCI_PREFIX = "suci"

	OPC = "OPC"
	OP  = "OP"

	NULL_SCHEME = 0
	A_SCHEME    = 1
	B_SCHEME    = 2
)

// Initialize random seed
func init() {
	rand.Seed(time.Now().UnixNano())
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

// Helper Functions
func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func md5Hash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}

func generateRandomMsisdn(length int) string {
	const digits = "0123456789"

	msisdn := make([]byte, length)
	for i := 0; i < length; i++ {
		msisdn[i] = digits[rand.Intn(len(digits))]
	}
	return string(msisdn)
}

// OperatorConfig holds configuration for the Operator
type OperatorConfig struct {
	PlmnId            models.PlmnId
	Amf               string
	UeConfiguredNssai []models.Snssai
	UeDefaultNssai    []models.Snssai
	Profiles          []models.Profile
	GnbSearchList     []string
	Sessions          []models.Sessions
	UacAic            models.UacAic
	UacAcc            models.UacAcc
	Integrity         models.Integrity
	Ciphering         models.Ciphering
	IntegrityMaxRate  models.IntegrityMaxRate
}

// Operator represents the operator responsible for UE profile management
type Operator struct {
	config *OperatorConfig
}

// NewOperator creates a new Operator
func NewOperator(config *OperatorConfig) *Operator {
	return &Operator{
		config: config,
	}
}

// GenerateUe generates a new UE Profile and returns it along with any error encountered
func (o *Operator) GenerateUe() (*models.UeProfile, error) {
	// Check if Profiles slice is not empty
	if len(o.config.Profiles) == 0 {
		log.Println("Operator configuration has no Profiles defined")
		return nil, fmt.Errorf("operator configuration has no profiles defined")
	}

	// Generate SUPI and SUCI
	supi := o.randSupi()
	if supi == "" {
		return nil, fmt.Errorf("failed to generate SUPI")
	}

	// Select a random profile from Profiles slice
	selectedProfile := o.config.Profiles[rand.Intn(len(o.config.Profiles))]

	// Sử dụng selectedProfile.Scheme làm tham số thứ hai cho toSuci
	suci, err := o.toSuci(supi, selectedProfile.Scheme)
	if err != nil {
		log.Printf("Error generating SUCI: %v\n", err)
		return nil, err
	}

	// Generate UE Profile
	ueProfile := &models.UeProfile{
		Supi:                   supi,
		Suci:                   suci,
		PlmnId:                 o.config.PlmnId,
		UeConfiguredNssai:      o.config.UeConfiguredNssai,
		UeDefaultNssai:         o.config.UeDefaultNssai,
		RoutingIndicator:       "0000",
		HomeNetworkPrivateKey:  selectedProfile.PrivateKey,
		HomeNetworkPublicKey:   selectedProfile.PublicKey,
		HomeNetworkPublicKeyId: selectedProfile.Scheme,
		ProtectionScheme:       selectedProfile.Scheme,
		Key:                    o.randUeKey(),
		Op:                     o.randOp(),
		OpType:                 OP,
		Amf:                    o.config.Amf,
		Imei:                   o.randImei(),
		Imeisv:                 o.randImeiSv(),
		GnbSearchList:          o.config.GnbSearchList,
		Integrity:              o.config.Integrity,
		Ciphering:              o.config.Ciphering,
		UacAic:                 o.config.UacAic,
		UacAcc:                 o.config.UacAcc,
		Sessions:               o.config.Sessions,
		IntegrityMaxRate:       o.config.IntegrityMaxRate,
		CreatedAt:              time.Now(),
	}

	// Assign OP or OPC based on random value
	value := rand.Intn(2)
	if value == 0 {
		ueProfile.OpType = OP
	} else {
		ueProfile.OpType = OPC
	}

	// Call GenProfile to set the protection scheme and public key based on profile index
	err = GenProfile(ueProfile, selectedProfile.Scheme, o.config.Profiles)
	if err != nil {
		log.Printf("Error in GenProfile: %v\n", err)
		return nil, err
	}

	return ueProfile, nil
}

// GenProfile sets the protection scheme and public key based on profile index
func GenProfile(ue *models.UeProfile, profileScheme int, profiles []models.Profile) error {
	switch profileScheme {
	case A_SCHEME:
		ue.ProtectionScheme = A_SCHEME
		ue.HomeNetworkPublicKey = profiles[0].PublicKey
		ue.HomeNetworkPublicKeyId = A_SCHEME
	case B_SCHEME:
		ue.ProtectionScheme = B_SCHEME
		ue.HomeNetworkPublicKey = profiles[1].PublicKey
		ue.HomeNetworkPublicKeyId = B_SCHEME
	default:
		return fmt.Errorf("unsupported profile scheme: %d", profileScheme)
	}
	ue.RoutingIndicator = "0000"
	return nil
}

// randUeKey generates a random UE Key
func (o *Operator) randUeKey() string {
	return md5Hash(randSeq(16))
}

// randOp generates a random OP string
func (o *Operator) randOp() string {
	return md5Hash(randSeq(16))
}

// randSupi generates a random SUPI (e.g., IMSI)
func (o *Operator) randSupi() string {
	mcc := o.config.PlmnId.Mcc
	mnc := o.config.PlmnId.Mnc
	mcclen := len(mcc)
	mnclen := len(mnc)
	msinlen := 15 - mcclen - mnclen
	if msinlen <= 0 {
		log.Println("Invalid PLMN ID lengths leading to non-positive MSIN length")
		return ""
	}
	msisdn := generateRandomMsisdn(msinlen)
	return "imsi-" + mcc + mnc + msisdn
}

func (o *Operator) toSuci(supii string, profile int) (string, error) {
	// Check if profile index is valid
	if profile <= 0 || profile > len(o.config.Profiles) {
		return "", fmt.Errorf("invalid profile index: %d", profile)
	}

	// Extract profile information
	var profileText string
	var hnPubKey string
	if profile == A_SCHEME {
		profileText = "A"
		hnPubKey = o.config.Profiles[0].PublicKey
	} else if profile == B_SCHEME {
		profileText = "B"
		hnPubKey = o.config.Profiles[1].PublicKey // Sửa từ Profiles[0] sang Profiles[1]
	} else {
		return "", fmt.Errorf("unsupported profile: %d", profile)
	}

	// Create key pair
	a := supi.NewX25519("")
	ephprivKey := hex.EncodeToString(a.GetPrivKey())

	// Check SUPI format
	parts := strings.Split(supii, "-")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid SUPI format: %s", supii)
	}
	prefix := parts[0]

	// Process the prefix of SUPI
	if prefix == "suci" {
		return supii, nil
	} else if prefix != "imsi" {
		return "", fmt.Errorf("unsupported SUPI prefix: %s", prefix)
	}

	// Check PLMN configuration
	if len(o.config.PlmnId.Mcc) == 0 || len(o.config.PlmnId.Mnc) == 0 {
		return "", fmt.Errorf("missing PLMN ID configuration")
	}

	// Extract MCC and MNC
	mcclen := len(o.config.PlmnId.Mcc)
	mnclen := len(o.config.PlmnId.Mnc)
	if len(parts[1]) < mcclen+mnclen {
		return "", fmt.Errorf("invalid SUPI structure: %s", supii)
	}
	mnc := parts[1][:mnclen]
	mcc := parts[1][mnclen : mnclen+mcclen]
	msin := parts[1][mnclen+mcclen:]

	// SUCI formation
	suciTypeStr := strconv.Itoa(IMSI_TYPE)
	schemeOutput, err := supi.Supi2Suci(profileText, hnPubKey, ephprivKey, msin)
	if err != nil {
		log.Printf("Error generating SUCI: %v\n", err)
		return "", err
	}
	routingIndicator := 0
	routingIndicatorStr := strconv.Itoa(routingIndicator)
	profileStr := strconv.Itoa(profile)

	suci := strings.Join([]string{
		SUCI_PREFIX, suciTypeStr, mnc, mcc, routingIndicatorStr, profileStr, profileStr, hnPubKey, schemeOutput,
	}, "-")
	return suci, nil
}

// getKeyPair generates and returns a key pair (dummy implementation)
func (o *Operator) getKeyPair() (x supi.X25519) {
	x.GenerateKeyPair()
	return
}

// randImei generates a random IMEI
func (o *Operator) randImei() string {
	return generateRandomMsisdn(15)
}

// randImeiSv generates a random IMEISV
func (o *Operator) randImeiSv() string {
	return generateRandomMsisdn(16)
}
