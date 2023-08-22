package cmd

import (
	"context"
	"os"
)

func CheckError(err error) {
	if err != nil {
		if err != context.Canceled {

		}
		os.Exit(1)
	}
}
