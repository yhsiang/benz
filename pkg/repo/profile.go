package repo

import (
	"gorm.io/gorm"
)

type Profile struct {
	gorm.Model
	ID            uint   `gorm:"primary_key"`
	NRIC          string `gorm:"index:idx_nric,unique"`
	WalletAddress string `gorm:"index:idx_address,unique"`
}

func CreateProfile(db *gorm.DB, profile *Profile) error {
	result := db.Create(profile)

	return result.Error
}
