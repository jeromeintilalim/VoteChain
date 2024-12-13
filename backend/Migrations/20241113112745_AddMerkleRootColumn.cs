using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoteChain.Migrations
{
    /// <inheritdoc />
    public partial class AddMerkleRootColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Votes");

            migrationBuilder.AlterColumn<string>(
                name: "Nonce",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiryTime",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "JoinCode",
                table: "Positions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MerkleRoot",
                table: "Elections",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "HasVoted",
                table: "ElectionAccess",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsEnrolled",
                table: "ElectionAccess",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "WalletAddress",
                table: "ElectionAccess",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Partylist",
                table: "Candidates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Ballots",
                columns: table => new
                {
                    BallotId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ElectionId = table.Column<int>(type: "int", nullable: false),
                    VoterAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ballots", x => x.BallotId);
                });

            migrationBuilder.CreateTable(
                name: "VoteEntries",
                columns: table => new
                {
                    VoteEntryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BallotId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    MerkleProof = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoteEntries", x => x.VoteEntryId);
                    table.ForeignKey(
                        name: "FK_VoteEntries_Ballots_BallotId",
                        column: x => x.BallotId,
                        principalTable: "Ballots",
                        principalColumn: "BallotId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ElectionAccess_ElectionId",
                table: "ElectionAccess",
                column: "ElectionId");

            migrationBuilder.CreateIndex(
                name: "IX_ElectionAccess_UserId",
                table: "ElectionAccess",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VoteEntries_BallotId",
                table: "VoteEntries",
                column: "BallotId");

            migrationBuilder.AddForeignKey(
                name: "FK_ElectionAccess_Elections_ElectionId",
                table: "ElectionAccess",
                column: "ElectionId",
                principalTable: "Elections",
                principalColumn: "ElectionId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ElectionAccess_Users_UserId",
                table: "ElectionAccess",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ElectionAccess_Elections_ElectionId",
                table: "ElectionAccess");

            migrationBuilder.DropForeignKey(
                name: "FK_ElectionAccess_Users_UserId",
                table: "ElectionAccess");

            migrationBuilder.DropTable(
                name: "VoteEntries");

            migrationBuilder.DropTable(
                name: "Ballots");

            migrationBuilder.DropIndex(
                name: "IX_ElectionAccess_ElectionId",
                table: "ElectionAccess");

            migrationBuilder.DropIndex(
                name: "IX_ElectionAccess_UserId",
                table: "ElectionAccess");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiryTime",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "JoinCode",
                table: "Positions");

            migrationBuilder.DropColumn(
                name: "MerkleRoot",
                table: "Elections");

            migrationBuilder.DropColumn(
                name: "HasVoted",
                table: "ElectionAccess");

            migrationBuilder.DropColumn(
                name: "IsEnrolled",
                table: "ElectionAccess");

            migrationBuilder.DropColumn(
                name: "WalletAddress",
                table: "ElectionAccess");

            migrationBuilder.DropColumn(
                name: "Partylist",
                table: "Candidates");

            migrationBuilder.AlterColumn<string>(
                name: "Nonce",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Votes",
                columns: table => new
                {
                    VoteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    ElectionId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Votes", x => x.VoteId);
                });
        }
    }
}
