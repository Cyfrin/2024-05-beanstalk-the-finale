import { ethers } from "ethers";
import { BasicPreparedResult, RunContext, StepClass } from "src/classes/Workflow";
import { FarmFromMode } from "../types";
import { Clipboard } from "src/lib/depot";
import { ClipboardSettings } from "src/types";

export class UnwrapEth extends StepClass<BasicPreparedResult> {
  public name: string = "unwrapEth";

  constructor(public readonly fromMode: FarmFromMode = FarmFromMode.INTERNAL, public clipboard?: ClipboardSettings) {
    super();
  }

  async run(_amountInStep: ethers.BigNumber, context: RunContext) {
    if (!this.clipboard) {
      const pipelineWellSwapIndex = context.steps.findIndex(step => step.name === "pipelineWellSwap");
      const pipelineUniV3SwapIndex = context.steps.findIndex(step => step.name === "pipelineUniswapV3Swap");
      
      const pipelineStepIndex = Math.max(pipelineWellSwapIndex, pipelineUniV3SwapIndex);
      // If the action before or after (happens when reverse estimating) this one is a BEAN/USDC/DAI -> WETH swap through Pipeline...
      if (pipelineStepIndex >= 0 && Math.abs(pipelineStepIndex - context.step.index) === 1) {
        const slotToCopy = pipelineStepIndex === pipelineWellSwapIndex ? 6 : 9;
        // We use clipboard...
        this.clipboard = {
          // Then find the correct tag in the tag map
          tag: Object.keys(context.tagMap).find(tag => context.tagMap[tag] === pipelineStepIndex)!, 
          copySlot: slotToCopy, 
          pasteSlot: 0
        };
      };
    };
    return {
      name: this.name,
      amountOut: _amountInStep, // amountInStep should be an amount of ETH.
      prepare: () => {
        UnwrapEth.sdk.debug(`[${this.name}.encode()]`, { 
          fromMode: this.fromMode, 
          _amountInStep, 
          context, 
          clipboard: this.clipboard
        });
        return {
          target: UnwrapEth.sdk.contracts.beanstalk.address,
          callData: UnwrapEth.sdk.contracts.beanstalk.interface.encodeFunctionData("unwrapEth", [
            _amountInStep, // ignore minAmountOut since there is no slippage
            this.fromMode
          ]),
          clipboard: this.clipboard ? Clipboard.encodeSlot(context.step.findTag(this.clipboard.tag), this.clipboard.copySlot, this.clipboard.pasteSlot) : undefined
        };
      },
      decode: (data: string) => UnwrapEth.sdk.contracts.beanstalk.interface.decodeFunctionData("unwrapEth", data),
      decodeResult: (result: string) => UnwrapEth.sdk.contracts.beanstalk.interface.decodeFunctionResult("unwrapEth", result),
      };
  }
}
