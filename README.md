# Beanstalk: The Finale

[//]: # (contest-details-open)

## Contest Details

- Total Pool - $250,000
- H/M - $220,000
- Low - $10,000
- Community Judging - $20,000
  
- Starts: Monday, May 30, 2024
- Ends: Monday, July 8, 2024

### Stats

- nSLOC: 12,285
- Complexity Score: 7810

## About

Beanstalk is a permissionless fiat stablecoin protocol built on Ethereum. Its primary objective is to incentivize independent market participants to regularly cross the price of 1 Bean over its dollar peg in a sustainable fashion.

Beanstalk does not have any collateral requirements. Beanstalk uses credit instead of collateral to create Bean price stability relative to its value peg of $1. The practicality of using DeFi is currently limited by the lack of decentralized low-volatility assets with competitive carrying costs. Borrowing rates on USD stablecoins have historically been higher than borrowing rates on USD, even when supply increases rapidly. Non-competitive carrying costs are due to collateral requirements.

In particular, this audit is centered around the changes included in the Beanstalk 3 upgrade, details for which can be found under the Scope section. While all Beanstalk contracts will be in scope for this audit, it is recommended that Hawks spend time focused on the new and unaudited changes in the Beanstalk 3 upgrade. It is estimated that about 30-40% of the code in this audit is new and unaudited.

You can read an overview of how Beanstalk works [here](https://docs.bean.money/almanac/introduction/how-beanstalk-works).

- [Docs](https://docs.bean.money/)
- [Whitepaper](https://bean.money/beanstalk.pdf)
- [Website](https://bean.money/)
- [Beanstalk Farms Twitter](https://twitter.com/BeanstalkFarms)
- [Beanstalk Public GitHub Repo](https://github.com/BeanstalkFarms/Beanstalk)

## Actors

- Stalkholder / Silo Member
  - Anyone who Deposits assets on the Deposit Whitelist into the Silo, earning the illiquid Stalk token in doing so. Stalkholders participate in governance and earn Bean seigniorage.
- `gm` caller
  - Anyone who calls the `gm` function to start the next Season.
- Unripe holder
  - Anyone who holds Unripe Beans or Unripe LP. These assets were distributed to holders of BDV (Bean Denominated Value) at the time of the April 2022 governance exploit. Most Unripe holders have their Unripe assets Deposited in the Silo, and thus are also Stalkholders.
- Fertilizer holder
  - Anyone who holds Fertilizer, the debt asset earned by participating in Beanstalk's recapitalization.
- Pod holder
  - Anyone who holds Pods, the Beanstalk-native debt asset. Pods are minting when lending Beans to Beanstalk (Sowing Beans).

### Changes

The Beanstalk 3 upgrade includes implementations of:

- [RFC: Generalized Convert](https://github.com/BeanstalkFarms/Beanstalk/issues/716);
- [RFC: Generalized Flood](https://github.com/BeanstalkFarms/Beanstalk/issues/740);
- [RFC: Tractor](https://github.com/BeanstalkFarms/Beanstalk/issues/734);
- [RFC: Secure Beanstalk](https://github.com/BeanstalkFarms/Beanstalk/issues/729), which includes:
  - Upgrading the test suite to support Foundry;
  - Upgrading the Solidity version of Beanstalk from 0.7.6 to 0.8.20;
  - Migrating constants to state that are likely to be adjusted by the DAO in the future;
- Whitelist v1.1 (discussed later);
- Field V2 (discussed later); and
- A series of contracts that can be used to migrate Beanstalk's state to an Ethereum L2.

#### Whitelist v1.1

Whitelisting a Well requires code changes to the Beanstalk contracts. While the changes can potentially be minimal, they ultimately increase the friction associated with whitelisting a Well. Ideally, the DAO can whitelist a Well with the `init` function of a diamond cut.

Thus, we propose to implement a generalized oracle, liquidity weight function and Gauge Point function.

#### Field V2

Beanstalk cannot easily add, modify or remove Yield Distributors, i.e., places where new Bean mints are allocated (currently the Silo, Field and Barn). It also cannot easily change the distribution of new Bean mints between various Yield Distributors.

Beanstalk cannot support multiple Pod Lines, it cannot easily add, modify or remove Pod Lines and it cannot control the issuance of debt to particular Pod Lines.

Thus, we propose a generalized yield distribution system and Pod Line system. For reference, see [Temp-Check-4](https://snapshot.org/#/beanstalkfarms.eth/proposal/0xc716cb01aeecc01ea4127ace7219e7efe644e8173d228c6b6ff9331c4d373222).

#### L2 Migration

Beanstalk is a fairly gaseous protocol. While the costs of interacting with Beanstalk at the time of writing in May 2024 are reasonable, activity on Ethereum L1 is currently low. In the past when Gwei has reached mid to high double digit values, interacting with Beanstalk (such as Mowing, Planting, or Converting) have cost upwards of several hundred US dollars. This prices out smaller Farmers and reduces the efficacy of Beanstalk's peg maintenance mechanisms.

Thus, we propose a series of initialization scripts that migrate Beanstalk state to an L2 and a facet to allow smart contract addresses to choose an address on the L2 to claim their assets with. For reference, see [Temp-Check-5](https://snapshot.org/#/beanstalkfarms.eth/proposal/0x93dfc538a66c1c199f5c9f0fd9c0233ce3625c7ada9743bafc8b5fbc0fc38fc7).

[//]: # (contest-details-close)

[//]: # (scope-open)

## Scope

The following contracts are in scope.

The [Beanstalk 3 PR](https://github.com/BeanstalkFarms/Beanstalk/pull/909/files) on the public Beanstalk GitHub repo may be a useful reference for determining which code is new and unaudited.

```js
protocol/
└── contracts/
    ├── beanstalk/
    │   ├── Diamond.sol
    │   ├── Invariable.sol
    │   ├── ReentrancyGuard.sol
    │   ├── barn/
    │   │   ├── FertilizerFacet.sol
    │   │   └── UnripeFacet.sol
    │   ├── diamond/
    │   │   ├── DiamondCutFacet.sol
    │   │   ├── DiamondLoupeFacet.sol
    │   │   ├── OwnershipFacet.sol
    │   │   └── PauseFacet.sol
    │   ├── farm/
    │   │   ├── DepotFacet.sol
    │   │   ├── FarmFacet.sol
    │   │   ├── TokenFacet.sol
    │   │   ├── TokenSupportFacet.sol
    │   │   └── TractorFacet.sol
    │   ├── field/
    │   │   └── FieldFacet.sol
    │   ├── init/
    │   │   └── reseed/
    │   │       ├── L1/
    │   │       │   └── ReseedL2Migration.sol
    │   │       └── L2/
    │   │           ├── ReseedBarn.sol
    │   │           ├── ReseedBean.sol
    │   │           ├── ReseedField.sol
    │   │           ├── ReseedInternalBalances.sol
    │   │           ├── ReseedSilo.sol
    │   │           ├── ReseedSun.sol
    │   │           └── ReseedWhitelist.sol
    │   ├── market/
    │   │   └── MarketplaceFacet/
    │   │       ├── Listing.sol
    │   │       ├── MarketplaceFacet.sol
    │   │       ├── Order.sol
    │   │       └── PodTransfer.sol
    │   ├── metadata/
    │   │   ├── MetadataFacet.sol
    │   │   └── MetadataImage.sol
    │   ├── migration/
    │   │   ├── BeanL1RecieverFacet.sol
    │   │   ├── BeanL2MigrationFacet.sol
    │   │   ├── L1AppStorage.sol
    │   │   ├── L1Libraries/
    │   │   │   ├── LibBalance.sol
    │   │   │   ├── LibEth.sol
    │   │   │   ├── LibL1AppStorage.sol
    │   │   │   ├── LibTokenApprove.sol
    │   │   │   ├── LibTransfer.sol
    │   │   │   └── LibWeth.sol
    │   │   ├── L1ReentrancyGuard.sol
    │   │   └── L1TokenFacet.sol
    │   ├── silo/
    │   │   ├── ApprovalFacet.sol
    │   │   ├── BDVFacet.sol
    │   │   ├── ConvertFacet.sol
    │   │   ├── ConvertGettersFacet.sol
    │   │   ├── EnrootFacet.sol
    │   │   ├── L2ContractMigrationFacet.sol
    │   │   ├── PipelineConvertFacet.sol
    │   │   ├── SiloFacet/
    │   │   │   ├── SiloFacet.sol
    │   │   │   ├── SiloGettersFacet.sol
    │   │   │   └── TokenSilo.sol
    │   │   └── WhitelistFacet/
    │   │       ├── WhitelistFacet.sol
    │   │       └── WhitelistedTokens.sol
    │   ├── storage/
    │   │   ├── Account.sol
    │   │   ├── AppStorage.sol
    │   │   └── System.sol
    │   └── sun/
    │       ├── GaugePointFacet.sol
    │       ├── LiquidityWeightFacet.sol
    │       ├── OracleFacet.sol
    │       └── SeasonFacet/
    │           ├── Distribution.sol
    │           ├── Oracle.sol
    │           ├── SeasonFacet.sol
    │           ├── SeasonGettersFacet.sol
    │           ├── Sun.sol
    │           └── Weather.sol
    ├── ecosystem/
    │   ├── Drafter.sol
    │   ├── ShipmentPlanner.sol
    │   ├── junction/
    │   │   ├── Junction.sol
    │   │   ├── LogicJunction.sol
    │   │   └── MathJunction.sol
    │   ├── oracles/
    │   │   └── UsdOracle.sol
    │   ├── price/
    │   │   ├── BeanstalkPrice.sol
    │   │   ├── P.sol
    │   │   └── WellPrice.sol
    ├── libraries/
    │   ├── Convert/
    │   │   ├── LibChopConvert.sol
    │   │   ├── LibConvert.sol
    │   │   ├── LibConvertData.sol
    │   │   ├── LibLambdaConvert.sol
    │   │   ├── LibPipelineConvert.sol
    │   │   ├── LibUnripeConvert.sol
    │   │   └── LibWellConvert.sol
    │   ├── Decimal.sol
    │   ├── LibAppStorage.sol
    │   ├── LibBarnRaise.sol
    │   ├── LibBytes.sol
    │   ├── LibBytes64.sol
    │   ├── LibCases.sol
    │   ├── LibChop.sol
    │   ├── LibClipboard.sol
    │   ├── LibDiamond.sol
    │   ├── LibDibbler.sol
    │   ├── LibEvaluate.sol
    │   ├── LibFarm.sol
    │   ├── LibFertilizer.sol
    │   ├── LibFunction.sol
    │   ├── LibGauge.sol
    │   ├── LibIncentive.sol
    │   ├── LibLockedUnderlying.sol
    │   ├── LibMarket.sol
    │   ├── LibPRBMathRoundable.sol
    │   ├── LibReceiving.sol
    │   ├── LibRedundantMath128.sol
    │   ├── LibRedundantMath256.sol
    │   ├── LibRedundantMath32.sol
    │   ├── LibRedundantMathSigned128.sol
    │   ├── LibRedundantMathSigned256.sol
    │   ├── LibRedundantMathSigned96.sol
    │   ├── LibShipping.sol
    │   ├── LibTractor.sol
    │   ├── LibUnripe.sol
    │   ├── Minting/
    │   │   ├── LibMinting.sol
    │   │   └── LibWellMinting.sol
    │   ├── Oracle/
    │   │   ├── LibChainlinkOracle.sol
    │   │   ├── LibDeltaB.sol
    │   │   ├── LibEthUsdOracle.sol
    │   │   ├── LibOracleHelpers.sol
    │   │   ├── LibUniswapOracle.sol
    │   │   ├── LibUsdOracle.sol
    │   │   ├── LibWstethEthOracle.sol
    │   │   └── LibWstethUsdOracle.sol
    │   ├── Silo/
    │   │   ├── LibFlood.sol
    │   │   ├── LibGerminate.sol
    │   │   ├── LibSilo.sol
    │   │   ├── LibSiloPermit.sol
    │   │   ├── LibTokenSilo.sol
    │   │   ├── LibWhitelist.sol
    │   │   └── LibWhitelistedTokens.sol
    │   ├── Token/
    │   │   ├── LibApprove.sol
    │   │   ├── LibBalance.sol
    │   │   ├── LibEth.sol
    │   │   ├── LibTokenApprove.sol
    │   │   ├── LibTokenPermit.sol
    │   │   ├── LibTransfer.sol
    │   │   └── LibWeth.sol
    │   └── Well/
    │       ├── LibWell.sol
    │       └── LibWellBdv.sol
    └── tokens/
        ├── Bean.sol
        ├── ERC20/
        │   └── BeanstalkERC20.sol
        └── Fertilizer/
            ├── Fertilizer.sol
            ├── Fertilizer1155.sol
            └── Internalizer.sol
```

## Compatibilities

Beanstalk implements the [ERC-2535 Diamond standard](https://docs.bean.money/developers/overview/eip-2535-diamond). It supports various whitelists for [Deposits](https://docs.bean.money/almanac/farm/silo#deposit-whitelist), [Minting](https://docs.bean.money/almanac/farm/sun#minting-whitelist), [Converts](https://docs.bean.money/almanac/peg-maintenance/convert#convert-whitelist), etc., particularly for LP tokens from [Basin](https://basin.exchange/).

Blockchains:

- Ethereum

Tokens:

- ERC-20 (all are accepted in Farm balances, a whitelist is accepted on the Deposit Whitelist, etc.)
- ERC-1155 (Fertilizer and Deposits are ERC-1155 tokens)

[//]: # (scope-close)

[//]: # (getting-started-open)

## Getting Started

Install node version v16.20.0, using nvm or any node version package manager:

```
nvm install v16.20.0
```

Clone the contest repo:
```
git clone https://github.com/Cyfrin/2024-05-beanstalk-the-finale.git
cd 2024-05-beanstalk-the-finale
```

Install dependencies:

```
cd protocol
yarn
```

Add RPCs for mainnet testing. You can get a basic RPC from sites such as https://www.alchemy.com/:

```bash
export FORKING_RPC={MAINNET_RPC}

export BASE_FORKING_RPC={BASE_RPC}
```

Generate:

```bash
yarn generate
yarn hardhat mockDiamondABI
```

To run foundry tests:

```bash
foundryup
forge install foundry-rs/forge-std
forge test
```

To run hardhat tests:

```bash
yarn hardhat test
```

[//]: # (getting-started-close)

[//]: # (known-issues-open)

## Known Issues

All findings in the following resources are considered known issues:

- All Beanstalk audit reports listed in this [repository](https://github.com/BeanstalkFarms/Beanstalk-Audits);
- All bug reports from the Immunefi program listed [here](https://community.bean.money/bug-reports);
- All reports and known issues in past Beanstalk Codehawks audits:
  - [Beanstalk Codehawks Part 1](https://www.codehawks.com/report/clsxlpte900074r5et7x6kh96);
  - [Beanstalk Codehawks Part 2](https://www.codehawks.com/report/clu7665bs0001fmt5yahc8tyh); and
  - [Beanstalk Codehawks Part 3](https://www.codehawks.com/contests/clvo5kwin00078k6jhhjobn22).
- Additional Known Issues as detected by LightChaser available [here](https://github.com/Cyfrin/2024-05-beanstalk-the-finale/issues/1)

[//]: # (known-issues-close)
