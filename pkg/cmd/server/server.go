package server

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/yhsiang/benz/pkg/cmd"
	"github.com/yhsiang/benz/pkg/controller"
	"github.com/yhsiang/benz/pkg/database"
	"github.com/yhsiang/benz/pkg/util"
	"gorm.io/gorm"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NewCommand() *cobra.Command {
	var command = &cobra.Command{
		Use:   "server",
		Short: "Run api server",
		Long:  "Run api server to upload NRIC data",
		Run: func(c *cobra.Command, args []string) {
			viper.SetEnvKeyReplacer(strings.NewReplacer("-", "_"))

			// Enable environment variable binding, the env vars are not overloaded yet.
			viper.AutomaticEnv()

			dbname := viper.GetString("postgres-database")
			dbuser := viper.GetString("postgres-user")
			dbpass := viper.GetString("postgres-password")
			dbhost := viper.GetString("postgres-host")
			dbport := viper.GetString("postgres-port")

			db, err := database.New(util.FormatPostgresDSN(dbuser, dbpass, dbhost, dbport, dbname))
			cmd.CheckError(err)

			router := gin.New()
			config := cors.DefaultConfig()
			config.AllowOrigins = []string{os.Getenv("WEBAPP_URL")}

			router.Use(cors.New(config))
			router.Use(gin.Logger())
			router.Use(gin.Recovery())

			router.ForwardedByClientIP = true
			router.SetTrustedProxies([]string{"127.0.0.1"})

			dc := controller.DataController{Database: db}
			router.POST("/profile", dc.Create)
			router.GET("/", func(ctx *gin.Context) {
				ctx.JSON(http.StatusOK, gin.H{"timestamp": time.Now().Unix()})
			})

			host := viper.GetString("host")
			port := viper.GetString("port")
			router.Run(fmt.Sprintf("%s:%s", host, port))
		},
	}

	command.PersistentFlags().StringP("port", "p", "8081", "api server port")
	viper.BindPFlag("port", command.PersistentFlags().Lookup("port"))

	command.PersistentFlags().StringP("host", "H", "localhost", "api server host")
	viper.BindPFlag("host", command.PersistentFlags().Lookup("host"))
	return command
}

func useDatabase(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	}
}
