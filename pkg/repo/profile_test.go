package repo

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestCreateProfile(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	assert.NoError(t, err)

	err = db.AutoMigrate(&Profile{})
	assert.NoError(t, err)

	err = CreateProfile(db, &Profile{NRIC: "S2218792I", WalletAddress: "0xabc"})
	assert.NoError(t, err)
	// same nric
	err = CreateProfile(db, &Profile{NRIC: "S2218792I", WalletAddress: "0xdef"})
	assert.Errorf(t, err, "UNIQUE constraint failed")
	// same address
	err = CreateProfile(db, &Profile{NRIC: "T8883153A", WalletAddress: "0xabc"})
	assert.Errorf(t, err, "UNIQUE constraint failed")
	// same nric and adress
	err = CreateProfile(db, &Profile{NRIC: "S2218792I", WalletAddress: "0xabc"})
	assert.Errorf(t, err, "UNIQUE constraint failed")

	var profiles []Profile
	result := db.Find(&profiles)
	assert.Equal(t, int64(1), result.RowsAffected)
}
