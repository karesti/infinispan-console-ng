import * as React from 'react';
import {useState} from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Divider,
  DividerVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
} from '@patternfly/react-core';
import {Link} from 'react-router-dom';
import {global_spacer_md} from '@patternfly/react-tokens';
import {useApiAlert} from '@app/utils/useApiAlert';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {TableErrorState} from '@app/Common/TableErrorState';
import {PurgeIndex} from '@app/IndexManagement/PurgeIndex';
import {Reindex} from '@app/IndexManagement/Reindex';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";
import {ConsoleACL} from "@services/securityService";
import {useConnectedUser} from "@app/services/userManagementHook";
import {useSearchStats} from "@app/services/statsHook";

const IndexManagement = (props) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const { connectedUser } = useConnectedUser();
  const cacheName = decodeURIComponent(props.computedMatch.params.cacheName);
  const {stats, loading, error, setLoading} = useSearchStats(cacheName)
  const [purgeModalOpen, setPurgeModalOpen] = useState<boolean>(false);
  const [reindexModalOpen, setReindexModalOpen] = useState<boolean>(false);

  const closePurgeModal = () => {
    setPurgeModalOpen(false);
    setLoading(true);
  };

  const closeReindexModal = () => {
    setReindexModalOpen(false);
    setLoading(true);
  };

  const buildReindexAction = () => {
    if(!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return ;
    }

    if (stats?.reindexing) {
      return <Spinner size={'md'} />;
    }
    return (
      <Button
        variant={ButtonVariant.secondary}
        onClick={() => setReindexModalOpen(true)}
      >
        Rebuild index
      </Button>
    );
  };

  const buildPurgeIndexButton = () => {
    if(!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return ;
    }

   return (
     <LevelItem>
      <Button
        variant={ButtonVariant.danger}
        disabled={!stats?.reindexing}
        onClick={() => setPurgeModalOpen(true)}
      >
        Clear index
      </Button>
     </LevelItem>
   );
  }

  const buildIndexPageContent = () => {
    if (loading) {
      return (
        <Spinner size={'lg'} />
        );
    }

    if (error != '') {
      return (
        <TableErrorState error={error} />
        );
    }

    if (stats) {
      return (
        <Grid hasGutter>
          {stats.index.map(indexData =>
            <GridItem span={6}>
              <TextContent style={{marginTop: global_spacer_md.value}}>
                <TextList component={TextListVariants.dl} key="indexes">
                  <TextListItem component={TextListItemVariants.dt} key={'className'}>
                    Class name
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dd}
                    key={'classNameValue'}
                  >
                    <TextContent>{indexData.name}</TextContent>
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dt}
                    key={'entriesCount'}
                  >
                    Number of entities
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dd}
                    key={'entriesCountValue'}
                  >
                    <TextContent>
                      {indexData.count}
                    </TextContent>
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt} key={'sizes'}>
                    Index size
                  </TextListItem>
                  <TextListItem
                    component={TextListItemVariants.dd}
                    key={'sizesValue'}
                  >
                    <TextContent>
                      {indexData.size}
                    </TextContent>
                  </TextListItem>
                </TextList>
              </TextContent>
            </GridItem>
          )}
        </Grid>
      );
    }

    return (
      <Alert variant={AlertVariant.info} title={'Indexes are empty'}/>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb
          currentPage="Index management"
          cacheName={cacheName}
        />
        <Level>
          <LevelItem>
            <TextContent
              style={{ marginTop: global_spacer_md.value }}
              key={'title-indexing'}
            >
              <Text component={TextVariants.h1} key={'title-value-indexing'}>
                Indexing
              </Text>
            </TextContent>
          </LevelItem>
          {buildPurgeIndexButton()}
        </Level>

        <Divider component={DividerVariant.hr}></Divider>
        {buildIndexPageContent()}
        {buildReindexAction()}
        <TextContent>
        <Text key={'button-back'}>
          <Link
            to={{
              pathname: '/cache/' + encodeURIComponent(cacheName),
            }}
          >
            <Button>Back</Button>
          </Link>
        </Text>
        </TextContent>
        <PurgeIndex
          cacheName={cacheName}
          isModalOpen={purgeModalOpen}
          closeModal={closePurgeModal}
        />
        <Reindex
          cacheName={cacheName}
          isModalOpen={reindexModalOpen}
          closeModal={closeReindexModal}
        />
      </PageSection>
    </React.Fragment>
  );
};
export { IndexManagement };
