import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Chip, Container, Stack } from '@mui/material';
import SiloActions from '~/components/Silo/Actions';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import TokenIcon from '~/components/Common/TokenIcon';
import { ERC20Token } from '~/classes/Token';
import usePools from '~/hooks/beanstalk/usePools';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import GuideButton from '~/components/Common/Guide/GuideButton';
import {
  HOW_TO_CONVERT_DEPOSITS,
  HOW_TO_DEPOSIT_IN_THE_SILO,
  HOW_TO_TRANSFER_DEPOSITS,
  HOW_TO_WITHDRAW_FROM_THE_SILO,
} from '~/util/Guides';
import SiloAssetOverviewCard from '~/components/Silo/SiloAssetOverviewCard';
import PagePath from '~/components/Common/PagePath';
import { XXLWidth } from '~/components/App/muiTheme';

import { FC } from '~/types';
import useFarmerSilo from '~/hooks/farmer/useFarmerSilo';

const guides = [
  HOW_TO_DEPOSIT_IN_THE_SILO,
  HOW_TO_CONVERT_DEPOSITS,
  HOW_TO_TRANSFER_DEPOSITS,
  HOW_TO_WITHDRAW_FROM_THE_SILO,
];

const SILO_ACTIONS_MAX_WIDTH = '480px';

const TokenPage: FC<{}> = () => {
  // Constants
  const whitelist = useWhitelist();
  const pools = usePools();

  // Routing
  let { address } = useParams<{ address: string }>();
  address = address?.toLowerCase();

  // State
  const farmerSilo = useFarmerSilo();
  // Ensure this address is a whitelisted token
  if (!address || !whitelist?.[address]) {
    return <div>Not found</div>;
  }

  // Load this Token from the whitelist
  const whitelistedToken = whitelist[address];
  const siloBalance = farmerSilo.balances[whitelistedToken.address];

  // Most Silo Tokens will have a corresponding Pool.
  // If one is available, show a PoolCard with state info.
  const pool = pools[address];

  // If no data loaded...
  if (!whitelistedToken) return null;

  const tokenIsBEAN3CRV =
    address.toLowerCase() === '0xc9c32cd16bf7efb85ff14e0c8603cc90f6f2ee49';

  return (
    <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
      <Stack gap={2} width="100%">
        <PagePath
          items={[
            { path: '/silo', title: 'Silo' },
            {
              path: `/silo/${whitelistedToken.address}`,
              title: whitelistedToken.name,
            },
          ]}
        />
        <PageHeaderSecondary
          title={whitelistedToken.name}
          titleAlign="left"
          icon={
            <TokenIcon css={{ marginBottom: -3 }} token={whitelistedToken} />
          }
          returnPath="/silo"
          hideBackButton
          control={
            <GuideButton
              title="The Farmers' Almanac: Silo Guides"
              guides={guides}
            />
          }
        />
        {tokenIsBEAN3CRV && (
          <Chip
            sx={{
              border: '1px solid #ae2d20',
              color: '#647265',
              backgroundColor: '#fbeaeb',
              marginTop: '5px',
              padding: '15px 10px',
            }}
            label={
              <span>
                This token was removed from the Deposit Whitelist in{' '}
                <Link to="/governance/0xec4d347918be45d2ec92de0c87a8802ab8e2017d17b5e5809c91a02ea6b9ae66">
                  BIP-45
                </Link>
                . Farmers may no longer Deposit this token into the Silo. Any
                Deposits before the upgrade can be Converted, Transfered or
                Withdrawn.{' '}
              </span>
            }
          />
        )}
        <Stack gap={2} direction={{ xs: 'column', lg: 'row' }} width="100%">
          <Stack
            width="100%"
            height="100%"
            sx={({ breakpoints }) => ({
              width: '100%',
              minWidth: 0,
              [breakpoints.up('lg')]: { maxWidth: '850px' },
            })}
          >
            <SiloAssetOverviewCard token={whitelistedToken} />
          </Stack>
          <Stack
            gap={2}
            width="100%"
            sx={{ maxWidth: { lg: SILO_ACTIONS_MAX_WIDTH } }}
          >
            <SiloActions
              pool={pool}
              token={whitelistedToken as ERC20Token}
              siloBalance={siloBalance}
            />
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default TokenPage;
