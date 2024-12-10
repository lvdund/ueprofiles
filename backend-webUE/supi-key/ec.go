package supi

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math"
	"math/big"

	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/curve25519"
	"maze.io/x/crypto/x25519"
)

var log *logrus.Entry

/*func intToU32BE(n uint32) []byte {
	result := make([]byte, 4)
	binary.BigEndian.PutUint32(result, n)
	return result
}*/

const (
	ProfileAMacKeyLen = 32 // octets
	ProfileAEncKeyLen = 16 // octets
	ProfileAIcbLen    = 16 // octets
	ProfileAMacLen    = 8  // octets
	ProfileAHashLen   = 32 // octets
)

// profile B.
const (
	ProfileBMacKeyLen = 32 // octets
	ProfileBEncKeyLen = 16 // octets
	ProfileBIcbLen    = 16 // octets
	ProfileBMacLen    = 8  // octets
	ProfileBHashLen   = 32 // octets
)

type X25519 struct {
	privKey []byte
	pubKey  []byte
}

func (x *X25519) NewX25519(loc_privKey string) *X25519 {
	if loc_privKey == "" {
		x.GenerateKeyPair()
	} else {
		x.GenerateKeyFromExistingPrivateKey(loc_privKey)
	}
	return x
}

const PrivateKeySize = 32

type PublicKey struct {
	b [32]byte
}

type PrivateKey struct {
	PublicKey
	b [PrivateKeySize]byte
}

func (x *X25519) GenerateKeyFromExistingPrivateKey(ExistingPrivateKey string) error {

	existingPrivateKey, _ := hex.DecodeString(ExistingPrivateKey)
	x.privKey = existingPrivateKey
	privateKey := new(PrivateKey)
	copy(privateKey.b[:], existingPrivateKey[:])

	// Masking X25519 key as documented at https://cr.yp.to/ecdh.html
	privateKey.b[0x00] &= 0xf8
	privateKey.b[0x1f] &= 0x7f
	privateKey.b[0x1f] |= 0x40

	// Calculate public key
	curve25519.ScalarBaseMult(&privateKey.PublicKey.b, &privateKey.b)
	x.pubKey = privateKey.PublicKey.b[:]
	return nil
}
func (x *X25519) GenerateKeyPair() error {
	/*
	   generate_keypair- creates the public/priv key pair

	   Args: None

	   Returns: None
	*/
	privKeyTmp, err := x25519.GenerateKey(rand.Reader)
	if err != nil {
		fmt.Print("err")
		return err
	} else {
		x.privKey = privKeyTmp.Bytes()
		x.pubKey = privKeyTmp.Public().(*x25519.PublicKey).Bytes()
	}
	return nil
}

func (x *X25519) GetPubKey() []byte {
	// GetPubKey - Get the public key from pub/pruv pair
	//fmt.Println("generate keyprofile A")
	return x.pubKey
}

func (x *X25519) GetPrivKey() []byte {

	return x.privKey
}

func (x *X25519) GenerateSharedKey(hnPubKey []byte) ([]byte, error) {
	/*
	   generate_sharedkey - get the shared key
	*/
	var encryptSharedKey []byte
	if encryptSharedKeyTmp, err := curve25519.X25519(x.privKey, hnPubKey); err != nil {
		log.Printf("X25519 error: %+v", err)
	} else {
		encryptSharedKey = encryptSharedKeyTmp
	}
	return encryptSharedKey, nil
}

func checkOnCurve(curve elliptic.Curve, x, y *big.Int) error {
	// (0, 0) is the point at infinity by convention. It's ok to operate on it,
	// although IsOnCurve is documented to return false for it. See Issue 37294.
	if x.Sign() == 0 && y.Sign() == 0 {
		return nil
	}

	if !curve.IsOnCurve(x, y) {
		return fmt.Errorf("crypto/elliptic: attempted operation on invalid point")
	}

	return nil
}

// secp256r1 - profile B
type Secp256r1 struct {
	privKey *ecdsa.PrivateKey
}

func (x *Secp256r1) NewSecp256r1() *Secp256r1 {
	x.GenerateKeyPair()
	return x
}

func (x *Secp256r1) GenerateKeyPair() error {
	privKeyTmp, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		fmt.Print("err")
		return err
	} else {
		x.privKey = privKeyTmp
		return nil
	}
}
func (x *Secp256r1) GenerateKeyFromExistingPrivateKey(hexPrivateKey string) error {
	/*
		Generate a key pair with a pre-determined private key.
	*/
	bytePrivKey, _ := hex.DecodeString(hexPrivateKey)
	privateKey := new(big.Int).SetBytes(bytePrivKey)
	x.privKey = new(ecdsa.PrivateKey)
	x.privKey.PublicKey.Curve = elliptic.P256()
	x.privKey.D = new(big.Int).Set(privateKey)
	x.privKey.PublicKey.X, x.privKey.PublicKey.Y = elliptic.P256().ScalarBaseMult(privateKey.Bytes())
	return nil
}

func (x *Secp256r1) GetPubKey() []byte {
	pubKeyTemp := &x.privKey.PublicKey
	pubKey := compressPublicKey(pubKeyTemp)
	//fmt.Println("compressed format.")
	return pubKey
}

func (x *Secp256r1) GetPrivKey() []byte {
	return x.privKey.D.Bytes()
}

func compressPublicKey(pubkey *ecdsa.PublicKey) []byte {
	/*
		CompressPubkey encodes a public key to the 33-byte compressed format.
	*/
	//fmt.Println("cx:",pubkey.X)
	//fmt.Println("cy:",pubkey.Y)
	// big.Int.Bytes() will need padding in the case of leading zero bytes
	params := pubkey.Curve.Params()
	curveOrderByteSize := params.P.BitLen() / 8
	xBytes := pubkey.X.Bytes()
	signature := make([]byte, curveOrderByteSize+1)
	if pubkey.Y.Bit(0) == 1 {
		signature[0] = 0x03
	} else {
		signature[0] = 0x02
	}
	copy(signature[1+curveOrderByteSize-len(xBytes):], xBytes)
	return signature
}

func DecompressPubkey(pubkey []byte) (*ecdsa.PublicKey, error) {
	/*
		Decompress the public key into full X and Y coordinates.
	*/
	if len(pubkey) != 33 || (pubkey[0] != 0x02 && pubkey[0] != 0x03) {
		return nil, fmt.Errorf("invalid public key")
	}

	x := new(big.Int).SetBytes(pubkey[1:])

	// Calculate y^2
	yyy := new(big.Int).Mul(x, x)
	yyy.Mul(yyy, x)

	ax := new(big.Int).Mul(big.NewInt(3), x)

	yy := new(big.Int).Sub(yyy, ax)
	yy.Add(yy, elliptic.P256().Params().B)

	// Calculate y coordinate
	y1 := new(big.Int).ModSqrt(yy, elliptic.P256().Params().P)
	if y1 == nil {
		return nil, fmt.Errorf("cannot recover public key")
	}

	y2 := new(big.Int).Neg(y1)
	y2.Mod(y2, elliptic.P256().Params().P)

	var y *big.Int
	if pubkey[0] == 0x02 {
		if y1.Bit(0) == 0 {
			y = y1
		} else {
			y = y2
		}
	} else {
		if y1.Bit(0) == 1 {
			y = y1
		} else {
			y = y2
		}
	}

	return &ecdsa.PublicKey{X: x, Y: y, Curve: elliptic.P256()}, nil
}

func (x *Secp256r1) GenerateSharedKey(bytehnPubKey []byte) ([]byte, error) {
	/*
	   generate_sharedkey - get the shared key
	*/
	hnPubKey, _ := DecompressPubkey(bytehnPubKey)
	if err := checkOnCurve(elliptic.P256(), hnPubKey.X, hnPubKey.Y); err != nil {
		return []byte{}, err
	}
	decryptSharedKeytmp, _ := elliptic.P256().ScalarMult(hnPubKey.X, hnPubKey.Y, x.privKey.D.Bytes())
	decryptSharedKey := decryptSharedKeytmp.Bytes()
	return decryptSharedKey, nil
}

func KDF(sharedKey, publicKey []byte, profileEncKeyLen, profileMacKeyLen, profileHashLen int) []byte {
	var counter uint32 = 0x00000001
	var kdfKey []byte
	kdfRounds := int(math.Ceil(float64(profileEncKeyLen+profileMacKeyLen) / float64(profileHashLen)))
	for i := 1; i <= kdfRounds; i++ {
		counterBytes := make([]byte, 4)
		binary.BigEndian.PutUint32(counterBytes, counter)
		// fmt.Printf("counterBytes: %x\n", counterBytes)
		tmpK := sha256.Sum256(append(append(sharedKey, counterBytes...), publicKey...))
		sliceK := tmpK[:]
		kdfKey = append(kdfKey, sliceK...)
		// fmt.Printf("kdfKey in round %d: %x\n", i, kdfKey)
		counter++
	}
	return kdfKey
}

func HmacSha256(input, mackey []byte, maclen int) (tag []byte, err error) {
	/*
		Hashing the cipher text to create a digital signature.
	*/
	h := hmac.New(sha256.New, mackey)
	if _, err = h.Write(input); err != nil {
		//	log.Errorf("HMAC SHA256 error %+v", err)
		return
	}
	mac := h.Sum(nil)
	tag = mac[:maclen]
	return
}

func Aes128ctr(input, encKey, icb []byte) []byte {
	/*
		Using the AES-128 algorithm to encrypt SUPI into SUCI.
	*/
	output := make([]byte, len(input))
	block, err := aes.NewCipher(encKey)
	if err != nil {
		log.Printf("AES128 CTR error %+v", err)
	}
	stream := cipher.NewCTR(block, icb)
	stream.XORKeyStream(output, input)
	// fmt.Printf("aes input: %x %x %x\naes output: %x\n", input, encKey, icb, output)
	return output
}

func protect(supi []byte, kdfKey []byte) ([]byte, []byte) {
	/*
		Create the ciphertext and digital signature.
	*/
	encryptEncKey := kdfKey[:16]
	encryptIcb := kdfKey[16:32]
	macKey := kdfKey[32:64]
	cipherText := Aes128ctr(supi, encryptEncKey, encryptIcb)
	encryptMacTag, _ := HmacSha256(cipherText, macKey, ProfileAMacLen)
	return cipherText, encryptMacTag
}

type EllipticCurve interface {
	GetPubKey() []byte
	GenerateKeyPair() error
	GenerateSharedKey(hnPubKey []byte) ([]byte, error)
	GetPrivKey() []byte
}

// Factory functions to create instances
func NewX25519(loc_privKey string) EllipticCurve {
	x := &X25519{}
	if loc_privKey == "" {
		x.GenerateKeyPair()
	} else {
		x.GenerateKeyFromExistingPrivateKey(loc_privKey)
	}
	return x
}

func NewSecp256r1(loc_privKey string) EllipticCurve {
	x := &Secp256r1{}
	if loc_privKey == "" {
		x.GenerateKeyPair()
	} else {
		x.GenerateKeyFromExistingPrivateKey(loc_privKey)
	}
	return x
}

func encode_supi(profile string, stringHnPubKey string, ephprivKey string, msinString string) string {
	var a EllipticCurve
	if profile == "A" {
		a = NewX25519(ephprivKey)
	} else {
		a = NewSecp256r1(ephprivKey)
	}
	hnPubKey, _ := hex.DecodeString(stringHnPubKey)
	msin, _ := hex.DecodeString(msinString)
	pubKey := hex.EncodeToString(a.GetPubKey())
	//fmt.Println(pubKey)
	sharedKey, _ := a.GenerateSharedKey(hnPubKey)
	//fmt.Printf("Shared Key: %x\n", sharedKey)
	kdf_key := KDF(sharedKey, a.GetPubKey(), ProfileAEncKeyLen, ProfileAMacKeyLen, ProfileAHashLen)
	//fmt.Println("KDF Key: ", hex.EncodeToString(kdf_key))
	suci_bytes, macTag_UE_bytes := protect(msin, kdf_key)
	//publickey_hex := fmt.Sprintf("%x", publicKeyue)
	//fmt.Println("PublickeyUE:     ",publickey_hex)
	suci := hex.EncodeToString(suci_bytes)
	macTag_UE := hex.EncodeToString(macTag_UE_bytes)
	return pubKey + suci + macTag_UE
}

func Supi2Suci(profile string, stringHnPubKey string, ephprivKey string, msinString string) (suci string) {
	suci = encode_supi(profile, stringHnPubKey, ephprivKey, msinString)
	return
}
