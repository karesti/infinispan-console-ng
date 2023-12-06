import * as React from 'react';
import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ListVariant,
  LoginPage,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';

import icon from '!!url-loader!@app/assets/images/infinispan_logo_rgb_darkbluewhite_darkblue.svg';
import { CatalogIcon, GithubIcon, InfoIcon } from '@patternfly/react-icons';
import { chart_color_blue_500 } from '@patternfly/react-tokens';
import { ConsoleBackground } from '@app/Common/ConsoleBackgroud';
import { Support } from '@app/Support/Support';
import { KeycloakService } from '@services/keycloakService';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useHistory } from 'react-router';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';

const Welcome = () => {
  const { init } = useAppInitState();
  const { t } = useTranslation();
  const history = useHistory();
  const [supportOpen, setSupportOpen] = useState(false);
  const { notSecuredModeOn, logUser } = useConnectedUser();

  const brandname = t('brandname.brandname');

  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license', { brandname: brandname });

  const hotRodClientsLink = 'https://infinispan.org/hotrod-clients/';
  const aboutLink = 'https://infinispan.org/get-started/';
  const tutorialsLink = 'https://github.com/infinispan/infinispan-simple-tutorials';

  const buildFooter = () => {
    return (
      <Stack>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>{t('welcome-page.connect', { brandname: brandname })}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Button component="a" href={hotRodClientsLink} variant="link" target="_blank" icon={<CatalogIcon />}>
            {t('welcome-page.download')}
          </Button>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>{t('welcome-page.servers', { brandname: brandname })}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Button component="a" href={aboutLink} variant="link" target="_blank" icon={<InfoIcon />}>
            {t('welcome-page.learn-more')}
          </Button>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>{t('welcome-page.develop', { brandname: brandname })}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Button component="a" href={tutorialsLink} variant="link" target="_blank" icon={<GithubIcon />}>
            {t('welcome-page.tutorials')}
          </Button>
        </StackItem>
      </Stack>
    );
  };

  const login = () => {
    history.push('/' + history.location.search);
    location.reload();
  };

  const notSecured = () => {
    history.push('/' + history.location.search);
  };

  const goToTheConsole = t('welcome-page.go-to-console');

  const buildConsoleButton = () => {
    if (init == 'PENDING') {
      return <Spinner size={'sm'} />;
    }

    if (init == 'SERVER_ERROR') {
      return <Alert variant="danger" title="Server error. Check browser logs" />;
    }

    if (init == 'HTTP_LOGIN') {
      return (
        <Button
          onClick={() => {
            ConsoleServices.authentication()
              .loginLink()
              .then((r) => {
                if (r.success) {
                  logUser();
                  history.push('/' + history.location.search);
                } else {
                  // Do nothing
                }
              });
          }}
          component={'button'}
          style={{ backgroundColor: chart_color_blue_500.value }}
        >
          {goToTheConsole}
        </Button>
      );
    }

    if (init == 'NOT_READY') {
      return (
        <Button style={{ backgroundColor: chart_color_blue_500.value }} onClick={() => setSupportOpen(true)}>
          {goToTheConsole}
        </Button>
      );
    }

    if (init == 'READY') {
      return (
        <Button style={{ backgroundColor: chart_color_blue_500.value }} onClick={() => notSecuredModeOn()}>
          {goToTheConsole}
        </Button>
      );
    }

    return (
      <Button style={{ backgroundColor: chart_color_blue_500.value }} onClick={() => login()}>
        {goToTheConsole}
      </Button>
    );
  };

  return (
    <section>
      <ConsoleBackground />
      <Support isModalOpen={supportOpen} closeModal={() => window.location.reload()} />
      <LoginPage
        footerListVariants={ListVariant.inline}
        brandImgSrc={icon}
        brandImgAlt={brandname + ' logo'}
        backgroundImgAlt={brandname}
        loginTitle={'Welcome to ' + brandname + ' Server'}
        footerListItems={buildFooter()}
      >
        <Card>
          <CardHeader>{description1}</CardHeader>
          <CardBody>{description2}</CardBody>
          <CardBody>{license}</CardBody>
          <CardFooter>{buildConsoleButton()}</CardFooter>
        </Card>
      </LoginPage>
    </section>
  );
};

export { Welcome };
