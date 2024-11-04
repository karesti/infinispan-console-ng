import * as React from 'react';
import { useEffect } from 'react';
import {
  AboutModal,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Stack,
  StackItem
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/favicons/ms-icon-310x310.png';
import {
  FacebookIcon,
  GithubIcon,
  OutlinedCommentsIcon,
  StackOverflowIcon,
  TwitterIcon
} from '@patternfly/react-icons';
import { t_global_spacer_lg } from '@patternfly/react-tokens';
import { useFetchVersion } from '@app/services/serverHook';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const { version, loading, setLoading } = useFetchVersion();

  const infinispanGithubLink = 'https://github.com/infinispan/';
  const infinispanZulipLink = 'https://infinispan.zulipchat.com/';
  const infinispanStackOverflowLink = 'https://stackoverflow.com/questions/tagged/?tagnames=infinispan&sort=newest';
  const infinispanTwitterLink = 'https://twitter.com/infinispan/';
  const infinispanFacebookLink = 'https://www.facebook.com/infinispan/';
  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license', { brandname: brandname });
  const apacheLicense = t('welcome-page.apache-license');

  useEffect(() => {
    if (props.isModalOpen && version == '') {
      setLoading(true);
    }
  }, [props.isModalOpen]);

  return (
    <AboutModal
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      trademark="Sponsored by Red Hat"
      brandImageSrc={icon}
      brandImageAlt={brandname + ' Logo'}
      productName={brandname}
      // backgroundImageSrc={backgroundImage}
    >
      <Stack>
        <StackItem style={{ paddingBottom: t_global_spacer_lg.value }}>
          <Content component={ContentVariants.p}>{description1}</Content>
          <Content component={ContentVariants.p}>{description2}</Content>
          <Content component={ContentVariants.p}>
            {license}
            {apacheLicense}
          </Content>
        </StackItem>
        <StackItem style={{ paddingBottom: t_global_spacer_lg.value }}>
          <Divider />
        </StackItem>
        <StackItem style={{ paddingBottom: t_global_spacer_lg.value }}>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>Version</Content>
            <Content component={ContentVariants.dd}> {loading ? <Spinner size={'sm'} /> : version}</Content>
          </Content>
        </StackItem>
        <StackItem style={{ paddingBottom: t_global_spacer_lg.value }}>
          <Divider />
        </StackItem>
        <StackItem>
          <Flex>
            <FlexItem>
              <Button
                aria-label={'Github'}
                component={'a'}
                href={infinispanGithubLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <GithubIcon />
                </Icon>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={'Zulip'}
                component={'a'}
                href={infinispanZulipLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <OutlinedCommentsIcon />
                </Icon>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={'Stackoverflow'}
                component={'a'}
                href={infinispanStackOverflowLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <StackOverflowIcon />
                </Icon>
              </Button>
            </FlexItem>

            <FlexItem>
              <Button
                aria-label={'Twitter'}
                component={'a'}
                href={infinispanTwitterLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <TwitterIcon />
                </Icon>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={'Facebook'}
                component={'a'}
                href={infinispanFacebookLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <FacebookIcon />
                </Icon>
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    </AboutModal>
  );
};

export { About };
