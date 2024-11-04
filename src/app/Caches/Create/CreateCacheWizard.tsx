import React, { useState } from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  PageSection,
  PageSectionTypes,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  WizardStepType
} from '@patternfly/react-core';
import { useNavigate } from 'react-router';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useCreateCache } from '@app/services/createCacheHook';
import { useStateCallback } from '@app/services/stateCallbackHook';
import { useTranslation } from 'react-i18next';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { validFeatures } from '@app/utils/featuresValidation';
import CacheConfigEditor from '@app/Caches/Create/CacheConfigEditor';
import AdvancedOptionsConfigurator from '@app/Caches/Create/AdvancedOptionsConfigurator';
import ReviewCacheConfig from '@app/Caches/Create/ReviewCacheConfig';
import CreateCacheGettingStarted from '@app/Caches/Create/CreateCacheGettingStarted';
import BasicCacheConfigConfigurator from '@app/Caches/Create/BasicCacheConfigConfigurator';
import FeaturesSelector from '@app/Caches/Create/FeaturesSelector';
import DownloadCacheModal from '@app/Caches/Create/DownloadCacheModal';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';

const CacheEditorInitialState: CacheEditorStep = {
  editorConfig: '',
  configs: [],
  validConfig: 'default',
  errorConfig: '',
  selectedConfig: '',
  configExpanded: false,
  editorExpanded: false
};

const STEP_ADD_CONFIG = 'step-add-config';
const STEP_START = 'step-start';
const STEP_CONFIGURE = 'step-configure';
const SUBSTEP_BASIC = 'substep-configure-basics';
const SUBSTEP_FEATURES = 'substep-configure-features';
const SUBSTEP_ADVANCED = 'substep-configure-advanced';
const STEP_REVIEW = 'step-review';

const CreateCacheWizard = (props: { cacheManager: CacheManager; create: boolean }) => {
  const { addAlert } = useApiAlert();
  const { configuration } = useCreateCache();
  const { connectedUser } = useConnectedUser();

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  // State for wizard steps
  const [stateObj, setStateObj] = useStateCallback({
    showCacheEditor: false,
    showConfigurationSteps: false
  });

  const [cacheEditor, setCacheEditor] = useState<CacheEditorStep>(CacheEditorInitialState);
  const [reviewConfig, setReviewConfig] = useState<string>('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const [contentType, setContentType] = useState<'json' | 'yaml' | 'xml'>('json');
  const navigate = useNavigate();
  const closeWizard = () => {
    navigate('/');
  };

  const isCreateButton = (activeStep: WizardStepType): boolean => {
    return activeStep.id === STEP_ADD_CONFIG || activeStep.id === STEP_REVIEW;
  };

  const isButtonNextOrCreateDisabled = (activeStep: WizardStepType): boolean => {
    let activeButton = true;
    switch (activeStep.id) {
      case STEP_START:
        activeButton = configuration.start.valid;
        break;
      case STEP_ADD_CONFIG:
        activeButton = props.create && cacheEditor.validConfig !== 'error';
        break;
      case STEP_CONFIGURE:
        activeButton = configuration.basic.valid;
        break;
      case SUBSTEP_BASIC:
        activeButton = configuration.basic.valid;
        break;
      case SUBSTEP_FEATURES:
        activeButton = validFeatures(configuration);
        break;
      case SUBSTEP_ADVANCED:
        activeButton = configuration.advanced.valid;
        break;
      case STEP_REVIEW:
        activeButton = props.create;
        break;
      default:
    }

    return !activeButton;
  };

  const nextOrCreateToolbarItem = (activeStep: WizardStepType, onNext) => {
    if (isCreateButton(activeStep) && isButtonNextOrCreateDisabled(activeStep)) {
      // The user is not allowed to create a cache, don't display the create button
      return;
    }

    const buttonId = isCreateButton(activeStep) ? 'create-cache' : 'next-step';
    return (
      <Button
        id={buttonId}
        name={buttonId}
        variant="primary"
        type="submit"
        onClick={onNext}
        isDisabled={isButtonNextOrCreateDisabled(activeStep)}
        data-cy="wizardNextButton"
      >
        {isCreateButton(activeStep) ? t('caches.create.create-button-label') : t('caches.create.next-button-label')}
      </Button>
    );
  };

  const backToolbarItem = (activeStep: WizardStepType, onBack) => {
    return (
      <Button isDisabled={activeStep.id == STEP_START} variant="secondary" onClick={onBack} data-cy="wizardBackButton">
        {t('common.actions.back')}
      </Button>
    );
  };

  const cancelToolbarItem = (onClose) => {
    return (
      <Button variant="link" onClick={onClose} data-cy="cancelWizard">
        {t('caches.create.cancel-button-label')}
      </Button>
    );
  };

  const downloadToolbarItem = (activeStep) => {
    if (activeStep.id !== STEP_ADD_CONFIG && activeStep.id !== 'step') {
      return '';
    }
    if (activeStep.id === STEP_REVIEW && !configuration.advanced.valid) {
      return '';
    }

    if (activeStep.id === STEP_ADD_CONFIG && cacheEditor.validConfig !== 'success') {
      return '';
    }

    const buttonVariant = canCreateCache ? 'secondary' : 'primary';

    return (
      <Button variant={buttonVariant} onClick={() => setIsDownloadModalOpen(true)} data-cy="downloadModal">
        {t('caches.create.download-button-label')}
      </Button>
    );
  };

  const onSave = () => {
    const createCacheCall =
      configuration.start.createType === 'edit' // Check wizard option
        ? CacheConfigUtils.createCacheWithEditorStep(cacheEditor, configuration.start.cacheName)
        : CacheConfigUtils.createCacheWithWizardStep(
            reviewConfig === '' ? CacheConfigUtils.createCacheConfigFromData(configuration) : reviewConfig,
            configuration.start.cacheName,
            contentType
          );

    createCacheCall
      .then((actionResponse) => {
        if (actionResponse.success) {
          navigate('/');
        }
        return actionResponse;
      })
      .then((actionResponse) => addAlert(actionResponse));
  };

  const CustomStepsFooter = () => {
    const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
    return (
      <WizardFooterWrapper>
        <ActionList>
          <ActionListGroup>
            <ActionListItem>{backToolbarItem(activeStep, goToPrevStep)}</ActionListItem>
            <ActionListItem>{nextOrCreateToolbarItem(activeStep, goToNextStep)}</ActionListItem>
          </ActionListGroup>
          <ActionListGroup>
            <ActionListItem>{downloadToolbarItem(activeStep)}</ActionListItem>
          </ActionListGroup>
          <ActionListGroup>
            <ActionListItem>{cancelToolbarItem(close)}</ActionListItem>
          </ActionListGroup>
        </ActionList>
      </WizardFooterWrapper>
    );
  };

  const WizardStepConfigure = () => {
    const { activeStep } = useWizardContext();

    console.log(activeStep);
    return (
      <WizardStep
        id={STEP_START}
        name={t('caches.create.getting-started.nav-title')}
        footer={<CustomStepsFooter />}
        status={configuration.start.valid ? 'success' : 'default'}
      >
        <CreateCacheGettingStarted create={props.create} />
      </WizardStep>
    );
  };

  return (
    <PageSection type={PageSectionTypes.wizard}>
      <Wizard navAriaLabel={'Create Cache steps'} onClose={closeWizard} onSave={onSave} height={600}>
        {WizardStepConfigure()}
        <WizardStep
          id={STEP_ADD_CONFIG}
          name={t('caches.create.edit-config.nav-title')}
          footer={<CustomStepsFooter />}
          isHidden={!configuration.start.valid || configuration.start.createType == 'configure'}
        >
          <CacheConfigEditor
            cacheEditor={cacheEditor}
            cacheEditorModifier={setCacheEditor}
            setReviewConfig={setReviewConfig}
          />
        </WizardStep>
        <WizardStep
          id={STEP_CONFIGURE}
          name={'Configure the cache'}
          isHidden={!configuration.start.valid || configuration.start.createType == 'edit'}
          footer={<CustomStepsFooter />}
          isExpandable
          steps={[
            <WizardStep
              id={SUBSTEP_BASIC}
              name={t('caches.create.configurations.basic.nav-title')}
              footer={<CustomStepsFooter />}
            >
              <BasicCacheConfigConfigurator />
            </WizardStep>,
            <WizardStep
              id={SUBSTEP_FEATURES}
              name={t('caches.create.configurations.feature.nav-title', {
                brandname: brandname
              })}
              footer={<CustomStepsFooter />}
              isDisabled={!configuration.basic.valid}
            >
              {<FeaturesSelector />}
            </WizardStep>,
            <WizardStep
              id={SUBSTEP_ADVANCED}
              name={t('caches.create.configurations.advanced-options.nav-title')}
              footer={<CustomStepsFooter />}
              isDisabled={!configuration.basic.valid || !validFeatures(configuration)}
            >
              <AdvancedOptionsConfigurator cacheManager={props.cacheManager} />
            </WizardStep>
          ]}
        />

        <WizardStep
          id={STEP_REVIEW}
          name={t('caches.create.review.nav-title')}
          footer={<CustomStepsFooter />}
          isDisabled={!configuration.basic.valid || !validFeatures(configuration) || !configuration.advanced.valid}
          isHidden={!configuration.start.valid || configuration.start.createType == 'edit'}
        >
          <ReviewCacheConfig setReviewConfig={setReviewConfig} setContentType={setContentType} />
        </WizardStep>
      </Wizard>
      <DownloadCacheModal
        cacheName={configuration.start.cacheName}
        configuration={reviewConfig}
        isModalOpen={isDownloadModalOpen}
        closeModal={() => setIsDownloadModalOpen(false)}
        contentType={contentType}
      />
    </PageSection>
  );
};

export { CreateCacheWizard };
