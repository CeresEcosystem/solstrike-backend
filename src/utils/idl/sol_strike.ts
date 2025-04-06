/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sol_strike.json`.
 */
export type SolStrike = {
  address: 'F7Dr4bH5knKjzBj8fuRJT9QGtHLyQSWTnWxYetHDnWHA';
  metadata: {
    name: 'solStrike';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'buyChipWithSol';
      discriminator: [73, 167, 123, 166, 190, 79, 105, 127];
      accounts: [
        {
          name: 'buyer';
          writable: true;
          signer: true;
        },
        {
          name: 'globalConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [71, 76, 79, 66, 65, 76, 95, 67, 79, 78, 70, 73, 71];
              },
            ];
          };
        },
        {
          name: 'treasury';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [84, 82, 69, 65, 83, 85, 82, 89];
              },
            ];
          };
        },
        {
          name: 'chipMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [67, 72, 73, 80, 95, 77, 73, 78, 84];
              },
            ];
          };
        },
        {
          name: 'buyerChipAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'buyer';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'claimChips';
      discriminator: [145, 205, 154, 242, 241, 150, 215, 26];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'claimableRewardsAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
            ];
          };
        },
        {
          name: 'chipMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [67, 72, 73, 80, 95, 77, 73, 78, 84];
              },
            ];
          };
        },
        {
          name: 'treasury';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [84, 82, 69, 65, 83, 85, 82, 89];
              },
            ];
          };
        },
        {
          name: 'treasuryChipTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'treasury';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'claimerChipAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenProgram';
        },
      ];
      args: [];
    },
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'globalConfig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [71, 76, 79, 66, 65, 76, 95, 67, 79, 78, 70, 73, 71];
              },
            ];
          };
        },
        {
          name: 'chipMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [67, 72, 73, 80, 95, 77, 73, 78, 84];
              },
            ];
          };
        },
        {
          name: 'treasury';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [84, 82, 69, 65, 83, 85, 82, 89];
              },
            ];
          };
        },
        {
          name: 'treasuryChipTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'treasury';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'program';
          address: 'F7Dr4bH5knKjzBj8fuRJT9QGtHLyQSWTnWxYetHDnWHA';
        },
        {
          name: 'programData';
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'lamportsPrice';
          type: 'u64';
        },
      ];
    },
    {
      name: 'reserveChips';
      discriminator: [205, 32, 104, 2, 153, 194, 154, 38];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'treasury';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [84, 82, 69, 65, 83, 85, 82, 89];
              },
            ];
          };
        },
        {
          name: 'chipMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [67, 72, 73, 80, 95, 77, 73, 78, 84];
              },
            ];
          };
        },
        {
          name: 'treasuryChipTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'treasury';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'userChipAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenProgram';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'sellChip';
      discriminator: [229, 172, 251, 173, 192, 30, 63, 46];
      accounts: [
        {
          name: 'seller';
          writable: true;
          signer: true;
        },
        {
          name: 'globalConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [71, 76, 79, 66, 65, 76, 95, 67, 79, 78, 70, 73, 71];
              },
            ];
          };
        },
        {
          name: 'chipMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [67, 72, 73, 80, 95, 77, 73, 78, 84];
              },
            ];
          };
        },
        {
          name: 'treasury';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [84, 82, 69, 65, 83, 85, 82, 89];
              },
            ];
          };
        },
        {
          name: 'sellerChipAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'seller';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'chipMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setClaimableRewards';
      discriminator: [169, 73, 150, 241, 151, 85, 180, 223];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'program';
          address: 'F7Dr4bH5knKjzBj8fuRJT9QGtHLyQSWTnWxYetHDnWHA';
        },
        {
          name: 'programData';
        },
        {
          name: 'firstPlaceClaimableRewardsAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'firstPlaceAuthority';
              },
            ];
          };
        },
        {
          name: 'firstPlaceAuthority';
        },
        {
          name: 'secondPlaceClaimableRewardsAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'secondPlaceAuthority';
              },
            ];
          };
        },
        {
          name: 'secondPlaceAuthority';
        },
        {
          name: 'thirdPlaceClaimableRewardsAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'thirdPlaceAuthority';
              },
            ];
          };
        },
        {
          name: 'thirdPlaceAuthority';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'updateSolChipPrice';
      discriminator: [180, 205, 175, 85, 110, 6, 86, 162];
      accounts: [
        {
          name: 'globalConfig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [71, 76, 79, 66, 65, 76, 95, 67, 79, 78, 70, 73, 71];
              },
            ];
          };
        },
        {
          name: 'program';
          address: 'F7Dr4bH5knKjzBj8fuRJT9QGtHLyQSWTnWxYetHDnWHA';
        },
        {
          name: 'programData';
        },
        {
          name: 'signer';
          signer: true;
        },
      ];
      args: [
        {
          name: 'newPrice';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'claimableRewards';
      discriminator: [248, 50, 225, 101, 103, 22, 216, 218];
    },
    {
      name: 'globalConfig';
      discriminator: [149, 8, 156, 202, 160, 252, 176, 217];
    },
    {
      name: 'treasury';
      discriminator: [238, 239, 123, 238, 89, 1, 168, 253];
    },
  ];
  events: [
    {
      name: 'claimChipsEvent';
      discriminator: [152, 44, 253, 86, 202, 245, 24, 33];
    },
    {
      name: 'reserveChipsEvent';
      discriminator: [108, 116, 246, 235, 157, 223, 118, 255];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'overflow';
    },
  ];
  types: [
    {
      name: 'claimChipsEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'user';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'claimableRewards';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'globalConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lamportsChipPrice';
            type: 'u64';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'reserveChipsEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'user';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'treasury';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
  ];
};
