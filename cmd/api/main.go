package main

import (
	"github.com/yhsiang/benz/pkg/cmd"
	"github.com/yhsiang/benz/pkg/cmd/server"
)

func main() {
	err := server.NewCommand().Execute()
	cmd.CheckError(err)
}
