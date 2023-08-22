package database

import (
	"github.com/yhsiang/benz/pkg/repo"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func New(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(&repo.Profile{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
