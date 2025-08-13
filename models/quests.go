package models

import (
	"gorm.io/datatypes"
)

type Question struct {
	ID            uint           `gorm:"primaryKey;autoIncrement"`
	StoreID       uint           `gorm:"index;not null"`
	Question      string         `gorm:"type:text;not null"`
	ImageURL      string         `gorm:"type:text"`
	Options       datatypes.JSON `gorm:"type:jsonb;not null"`
	CorrectAnswer int            `gorm:"not null"`
	Votes         []Vote         `gorm:"foreignKey:QuestionID"`
}

type Vote struct {
	ID         uint `gorm:"primaryKey;autoIncrement"`
	QuestionID uint `gorm:"index;not null"`
	StoreID    uint `gorm:"not null"`
	UserID     uint `gorm:"not null"`
	Vote       bool `gorm:"not null"`
}
