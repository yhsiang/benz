package controller

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/lmittmann/w3"
	"github.com/lmittmann/w3/module/eth"
	"github.com/yhsiang/benz/pkg/repo"
	"github.com/yhsiang/benz/pkg/response"
	"gorm.io/gorm"
)

type DataController struct {
	Database *gorm.DB
}

type FormData struct {
	NRIC          string `json:"nric"`
	WalletAddress string `json:"wallet_address"`
}

var (
	nft = w3.A(os.Getenv("CONTRACT_ADDRESS"))
)

func (dc *DataController) Create(ctx *gin.Context) {
	var data FormData
	if err := ctx.Bind(&data); err != nil {
		ctx.JSON(http.StatusBadRequest, response.NewError(http.StatusBadRequest, err.Error()))
		return
	}

	if err := repo.CreateProfile(dc.Database, &repo.Profile{
		NRIC:          data.NRIC,
		WalletAddress: data.WalletAddress,
	}); err != nil {
		ctx.JSON(http.StatusBadRequest, response.NewError(http.StatusBadRequest, err.Error()))
		return
	}

	client := w3.MustDial(os.Getenv("RPC_URL"))
	defer client.Close()

	funcQueryReceipt := w3.MustNewFunc("queryReceipt(address)", "string")
	var receipt string
	err := client.Call(
		eth.CallFunc(funcQueryReceipt, nft, w3.A(data.WalletAddress)).Returns(&receipt),
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, response.NewError(http.StatusBadRequest, err.Error()))
		return
	}

	hash := sha256.Sum256([]byte(receipt))

	ctx.JSON(http.StatusOK, gin.H{"receipt": hex.EncodeToString(hash[:])})
}
