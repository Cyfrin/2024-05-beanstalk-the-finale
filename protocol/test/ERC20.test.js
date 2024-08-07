const { to6 } = require("./utils/helpers.js");
const { EXTERNAL, INTERNAL } = require("./utils/balances.js");
const { BEANSTALK } = require("./utils/constants");
const { signERC2612Permit } = require("eth-permit");
const { expect } = require("chai");
const { takeSnapshot, revertToSnapshot } = require("./utils/snapshot");

let snapshotId;

describe("ERC-20", function () {
  before(async function () {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [BEANSTALK]
    });

    [owner, user, user2] = await ethers.getSigners();

    const Bean = await ethers.getContractFactory("Bean", owner);
    bean = await Bean.deploy();
    await bean.deployed();
    await bean.mint(user.address, to6("100"));
    console.log("Bean deployed to:", bean.address);
  });

  beforeEach(async function () {
    snapshotId = await takeSnapshot();
  });

  afterEach(async function () {
    await revertToSnapshot(snapshotId);
  });

  describe("mint", async function () {
    it("mints if minter", async function () {
      await bean.mint(user2.address, to6("100"));
      expect(await bean.balanceOf(user2.address)).to.be.equal(to6("100"));
    });

    it("reverts if not minter", async function () {
      await expect(bean.connect(user).mint(user2.address, to6("100"))).to.be.revertedWith(
        "!Minter"
      );
    });
  });

  describe("permit", async function () {
    before(async function () {
      // signERC2612Permit: (provider: any, token: string | Domain, owner: string, spender: string, value?: string | number, deadline?: number | undefined, nonce?: number | undefined) => Promise<ERC2612PermitMessage & RSV>;
      result = await signERC2612Permit(
        ethers.provider,
        bean.address,
        user.address,
        owner.address,
        "10000000"
      );

      fakeResult = await signERC2612Permit(
        ethers.provider,
        user.address,
        user.address,
        owner.address,
        "10000000"
      );

      endedResult = await signERC2612Permit(
        ethers.provider,
        user.address,
        user.address,
        owner.address,
        "10000000",
        "1"
      );
    });

    it("revert if fake permit", async function () {
      await expect(
        bean
          .connect(user)
          .permit(
            user.address,
            owner.address,
            to6("10"),
            fakeResult.deadline,
            fakeResult.v,
            fakeResult.r,
            fakeResult.s
          )
      ).to.be.revertedWith("ERC2612InvalidSigner");
    });

    it("revert when too much", async function () {
      await bean
        .connect(user)
        .permit(
          user.address,
          owner.address,
          to6("10"),
          result.deadline,
          result.v,
          result.r,
          result.s
        );

      await expect(
        bean.connect(owner).transferFrom(user.address, user2.address, to6("20"))
      ).to.be.revertedWith("ERC20InsufficientAllowance");
    });

    it("revert deadline passed", async function () {
      await expect(
        bean
          .connect(user)
          .permit(
            user.address,
            owner.address,
            to6("10"),
            endedResult.deadline,
            endedResult.v,
            endedResult.r,
            endedResult.s
          )
      ).to.be.revertedWith("ERC2612ExpiredSignature");
    });

    it("transfers all", async function () {
      await bean
        .connect(user)
        .permit(
          user.address,
          owner.address,
          to6("10"),
          result.deadline,
          result.v,
          result.r,
          result.s
        );
      await bean.connect(owner).transferFrom(user.address, user2.address, to6("10"));

      expect(await bean.balanceOf(user2.address)).to.be.equal(to6("10"));
      expect(await bean.balanceOf(user.address)).to.be.equal(to6("90"));
    });

    it("transfers some", async function () {
      await bean
        .connect(user)
        .permit(
          user.address,
          owner.address,
          to6("10"),
          result.deadline,
          result.v,
          result.r,
          result.s
        );
      await bean.connect(owner).transferFrom(user.address, user2.address, to6("5"));

      expect(await bean.balanceOf(user2.address)).to.be.equal(to6("5"));
      expect(await bean.balanceOf(user.address)).to.be.equal(to6("95"));
      expect(await bean.allowance(user.address, owner.address)).to.be.equal(to6("5"));
    });
  });
});
