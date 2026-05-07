import type { IField } from './SchemaService';

export type FormValue = string | number | boolean | string[] | undefined;
export type SectionLayout = 'oneColumn' | 'twoColumn';
export type TransformType = 'trim' | 'uppercase' | 'lowercase' | 'upper' | 'lower';

export interface ISectionConfig {
  title: string;
  description?: string;
  layout?: SectionLayout;
  fields: string[];
}

export interface IFieldUiConfig {
  placeholder?: string;
  width?: 'half' | 'full';
  readOnly?: boolean;
}

export interface IValidationRule {
  required?: boolean;
  message?: string;
  warning?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface IFormJsonConfig {
  hiddenFields?: string[];
  fieldOrder?: string[];
  labels?: { [internalName: string]: string };
  helpText?: { [internalName: string]: string };
  sections?: ISectionConfig[];
  layout?: {
    rows?: string[][];
  };
  fields?: {
    [internalName: string]: IFieldUiConfig;
  };
  validation?: {
    [internalName: string]: IValidationRule;
  };
  defaults?: {
    [internalName: string]: FormValue;
  };
  transform?: {
    [internalName: string]: TransformType;
  };
  theme?: {
    accentColor?: string;
  };
}

const DEFAULT_HIDDEN_FIELDS: string[] = [
  'ID',
  'ContentType',
  'ContentTypeId',
  'Attachments',
  'Created',
  'Modified',
  'Author',
  'Editor',
  'Edit',
  'LinkTitle',
  'LinkTitleNoMenu',
  'DocIcon',
  'ItemChildCount',
  'FolderChildCount',
  'AppAuthor',
  'AppEditor',
  '_UIVersionString',
  '_UIVersion',
  '_ModerationStatus',
  '_ModerationComments',
  'FileRef',
  'FileDirRef',
  'FileLeafRef',
  'File_x0020_Type',
  'FSObjType',
  'HTML_x0020_File_x0020_Type',
  'ServerUrl',
  'EncodedAbsUrl',
  'BaseName',
  'MetaInfo',
  'owshiddenversion',
  'WorkflowVersion',
  'GUID',
  'ComplianceAssetId'
];

const MAX_FIELDS_PER_SECTION = 8;

const DEFAULT_INTERNAL_WORKFLOW_KEYWORDS: string[] = [
  'workflow',
  'stage',
  'approval',
  'approver',
  'decision',
  'review',
  'internal',
  'admin',
  'system',
  'status',
  'comments',
  'history',
  'completed',
  'processed'
];

const REQUESTER_PERSON_KEYWORDS: string[] = [
  'requester',
  'requestor',
  'submitter',
  'student',
  'employee',
  'preparedby',
  'prepared by',
  'createdby',
  'created by'
];

const CONTACT_PERSON_KEYWORDS: string[] = [
  'contact',
  'owner',
  'manager',
  'supervisor',
  'coordinator',
  'advisor'
];

const REVIEW_PERSON_KEYWORDS: string[] = [
  'approver',
  'approval',
  'reviewer',
  'review',
  'chair',
  'dean',
  'director',
  'vp',
  'vice president',
  'decision',
  'assignedto',
  'assigned to'
];

const ORGANIZATION_LOOKUP_KEYWORDS: string[] = [
  'department',
  'dept',
  'division',
  'office',
  'unit',
  'team',
  'area',
  'location',
  'building',
  'room'
];

const CAMPUS_LOOKUP_KEYWORDS: string[] = [
  'campus',
  'location',
  'site',
  'college',
  'center'
];

const CATEGORY_CHOICE_KEYWORDS: string[] = [
  'category',
  'type',
  'request type',
  'form type',
  'classification',
  'topic',
  'reason code'
];

const STATUS_WORKFLOW_KEYWORDS: string[] = [
  'status',
  'stage',
  'phase',
  'state',
  'decision',
  'outcome',
  'approval status',
  'review status'
];

const PRIORITY_CHOICE_KEYWORDS: string[] = [
  'priority',
  'urgency',
  'severity',
  'impact',
  'risk'
];

const containsAny = (text: string, keywords: string[]): boolean => {
  const normalizedText = text.toLowerCase();

  return keywords.some(keyword =>
    normalizedText.indexOf(keyword.toLowerCase()) !== -1
  );
};

const getSearchableText = (field: IField): string =>
  `${field.internalName || ''} ${field.title || ''}`.toLowerCase();

const shouldHideField = (field: IField): boolean => {
  if (DEFAULT_HIDDEN_FIELDS.indexOf(field.internalName) !== -1) return true;

  return false;
};

const hasAnyKeyword = (field: IField, keywords: string[]): boolean =>
  containsAny(getSearchableText(field), keywords);

const isUserField = (field: IField): boolean =>
  field.typeAsString === 'User' || field.typeAsString === 'UserMulti';

const isChoiceField = (field: IField): boolean =>
  field.typeAsString === 'Choice' || field.typeAsString === 'MultiChoice';

const isLookupField = (field: IField): boolean =>
  field.typeAsString === 'Lookup' || field.typeAsString === 'LookupMulti';

const createLabel = (field: IField): string =>
  field.title
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/ID/g, 'ID')
    .replace(/Email/g, 'Email')
    .replace(/Prereq/g, 'Prerequisite')
    .replace(/CutScore/g, 'Cut Score')
    .trim();

const splitFieldsIntoBalancedChunks = (
  fields: string[],
  maxFieldsPerSection: number = MAX_FIELDS_PER_SECTION
): string[][] => {
  if (fields.length <= maxFieldsPerSection) return [fields];

  const chunks: string[][] = [];

  for (let i = 0; i < fields.length; i += maxFieldsPerSection) {
    chunks.push(fields.slice(i, i + maxFieldsPerSection));
  }

  return chunks;
};

const addSectionIfNotEmpty = (
  sections: ISectionConfig[],
  title: string,
  description: string,
  fields: string[],
  layout: SectionLayout = 'twoColumn',
  maxFieldsPerSection: number = MAX_FIELDS_PER_SECTION
): void => {
  if (fields.length === 0) return;

  const fieldChunks = splitFieldsIntoBalancedChunks(fields, maxFieldsPerSection);

  fieldChunks.forEach((fieldChunk, index) => {
    sections.push({
      title:
        index === 0
          ? title
          : `Additional ${title.replace(' Information', '').replace(' / ', ' ').trim()}`,
      description:
        index === 0
          ? description
          : `Additional fields related to ${title.toLowerCase().replace('information', '').trim()}.`,
      layout,
      fields: fieldChunk
    });
  });
};

const shouldUseFullWidth = (field: IField): boolean => {
  if (field.typeAsString === 'Note') return true;
  if (isUserField(field)) return true;
  if (field.typeAsString === 'MultiChoice' || field.typeAsString === 'LookupMulti') return true;

  return hasAnyKeyword(field, [
    'description',
    'justification',
    'reason',
    'notes',
    'comment',
    'explanation',
    'details',
    'address'
  ]);
};

const buildFieldLookup = (fields: IField[]): { [internalName: string]: IField } => {
  const lookup: { [internalName: string]: IField } = {};

  fields.forEach(field => {
    lookup[field.internalName] = field;
  });

  return lookup;
};

const createAutomaticRows = (
  orderedFieldNames: string[],
  fieldLookup: { [internalName: string]: IField }
): string[][] => {
  const rows: string[][] = [];
  let pendingHalfWidthField: string | undefined;

  orderedFieldNames.forEach(fieldName => {
    const field = fieldLookup[fieldName];

    if (!field) return;

    if (shouldUseFullWidth(field)) {
      if (pendingHalfWidthField) {
        rows.push([pendingHalfWidthField]);
        pendingHalfWidthField = undefined;
      }

      rows.push([fieldName]);
      return;
    }

    if (!pendingHalfWidthField) {
      pendingHalfWidthField = fieldName;
      return;
    }

    rows.push([pendingHalfWidthField, fieldName]);
    pendingHalfWidthField = undefined;
  });

  if (pendingHalfWidthField) {
    rows.push([pendingHalfWidthField]);
  }

  return rows;
};

const classifyUserFieldBucket = (field: IField): 'requester' | 'contact' | 'review' | 'other' => {
  if (!isUserField(field)) return 'other';

  if (hasAnyKeyword(field, REVIEW_PERSON_KEYWORDS)) return 'review';
  if (hasAnyKeyword(field, REQUESTER_PERSON_KEYWORDS)) return 'requester';
  if (hasAnyKeyword(field, CONTACT_PERSON_KEYWORDS)) return 'contact';

  return 'other';
};

const classifyChoiceOrLookupBucket = (
  field: IField
): 'organization' | 'campus' | 'category' | 'status' | 'priority' | 'other' => {
  if (!isChoiceField(field) && !isLookupField(field)) return 'other';

  if (hasAnyKeyword(field, STATUS_WORKFLOW_KEYWORDS)) return 'status';
  if (hasAnyKeyword(field, PRIORITY_CHOICE_KEYWORDS)) return 'priority';
  if (hasAnyKeyword(field, ORGANIZATION_LOOKUP_KEYWORDS)) return 'organization';
  if (hasAnyKeyword(field, CAMPUS_LOOKUP_KEYWORDS)) return 'campus';
  if (hasAnyKeyword(field, CATEGORY_CHOICE_KEYWORDS)) return 'category';

  return 'other';
};

const getChoiceOrLookupHelpText = (field: IField): string => {
  const bucket = classifyChoiceOrLookupBucket(field);

  if (bucket === 'organization') {
    return 'Select the appropriate department, division, office, or organizational area.';
  }

  if (bucket === 'campus') {
    return 'Select the appropriate campus, location, or college site.';
  }

  if (bucket === 'category') {
    return 'Select the option that best describes this request.';
  }

  if (bucket === 'status') {
    return 'Select the current status, stage, decision, or workflow outcome.';
  }

  if (bucket === 'priority') {
    return 'Select the priority, urgency, or impact level for this request.';
  }

  return 'Select the appropriate value from the list.';
};

const getChoiceOrLookupPlaceholder = (field: IField): string => {
  const bucket = classifyChoiceOrLookupBucket(field);

  if (bucket === 'organization') return 'Select department or division';
  if (bucket === 'campus') return 'Select campus or location';
  if (bucket === 'category') return 'Select request type';
  if (bucket === 'status') return 'Select status';
  if (bucket === 'priority') return 'Select priority';

  return 'Select an option';
};

const collectFieldsByBucket = (
  visibleFields: IField[],
  groupedFieldNames: string[],
  bucket: 'organization' | 'campus' | 'category' | 'status' | 'priority'
): string[] => {
  const matches = visibleFields
    .filter(field =>
      groupedFieldNames.indexOf(field.internalName) === -1 &&
      classifyChoiceOrLookupBucket(field) === bucket
    )
    .map(field => field.internalName);

  matches.forEach(fieldName => groupedFieldNames.push(fieldName));

  return matches;
};

export const generateFormLayoutFromFields = (fields: IField[]): IFormJsonConfig => {
  const hiddenFields = [...DEFAULT_HIDDEN_FIELDS];

  const visibleFields = fields.filter(field => !shouldHideField(field));
  const fieldLookup = buildFieldLookup(visibleFields);

  const groupedFieldNames: string[] = [];

  const takeFields = (keywords: string[]): string[] => {
    const matches = visibleFields
      .filter(field =>
        groupedFieldNames.indexOf(field.internalName) === -1 &&
        hasAnyKeyword(field, keywords)
      )
      .map(field => field.internalName);

    matches.forEach(fieldName => groupedFieldNames.push(fieldName));

    return matches;
  };

  const requesterUserFields = visibleFields
    .filter(field =>
      groupedFieldNames.indexOf(field.internalName) === -1 &&
      classifyUserFieldBucket(field) === 'requester'
    )
    .map(field => field.internalName);

  requesterUserFields.forEach(fieldName => groupedFieldNames.push(fieldName));

  const requesterFields = [
    ...requesterUserFields,
    ...takeFields([
      'requester',
      'requestor',
      'student',
      'employee',
      'submitter',
      'first',
      'middle',
      'last',
      'name',
      'banner',
      'sid',
      'snumber',
      'idnumber'
    ])
  ];

  const contactUserFields = visibleFields
    .filter(field =>
      groupedFieldNames.indexOf(field.internalName) === -1 &&
      classifyUserFieldBucket(field) === 'contact'
    )
    .map(field => field.internalName);

  contactUserFields.forEach(fieldName => groupedFieldNames.push(fieldName));

  const contactFields = [
    ...contactUserFields,
    ...takeFields([
      'email',
      'phone',
      'mobile',
      'address',
      'city',
      'state',
      'zip'
    ])
  ];

  const organizationFields = collectFieldsByBucket(
    visibleFields,
    groupedFieldNames,
    'organization'
  );

  const campusFields = collectFieldsByBucket(
    visibleFields,
    groupedFieldNames,
    'campus'
  );

  const categoryFields = collectFieldsByBucket(
    visibleFields,
    groupedFieldNames,
    'category'
  );

  const priorityFields = collectFieldsByBucket(
    visibleFields,
    groupedFieldNames,
    'priority'
  );

  const academicFields = [
    ...campusFields,
    ...takeFields([
      'course',
      'subject',
      'prefix',
      'number',
      'section',
      'crn',
      'prereq',
      'prerequisite',
      'placement',
      'cutscore',
      'cut score',
      'term',
      'semester',
      'year',
      'program',
      'degree',
      'major',
      'catalog',
      'curriculum',
      'campus'
    ])
  ];

  const requestFields = [
    ...categoryFields,
    ...priorityFields,
    ...organizationFields,
    ...takeFields([
      'request',
      'type',
      'category',
      'department',
      'division',
      'priority',
      'summary',
      'description',
      'reason',
      'justification',
      'purpose',
      'details'
    ])
  ];

  const financialFields = takeFields([
    'amount',
    'cost',
    'total',
    'budget',
    'fund',
    'funding',
    'grant',
    'finance',
    'account',
    'org',
    'programcode',
    'index'
  ]);

  const acknowledgementFields = takeFields([
    'signature',
    'acknowledge',
    'acknowledgement',
    'certification',
    'confirm',
    'agreement',
    'completion',
    'date'
  ]);

  const reviewUserFields = visibleFields
    .filter(field =>
      groupedFieldNames.indexOf(field.internalName) === -1 &&
      classifyUserFieldBucket(field) === 'review'
    )
    .map(field => field.internalName);

  reviewUserFields.forEach(fieldName => groupedFieldNames.push(fieldName));

  const statusFields = collectFieldsByBucket(
    visibleFields,
    groupedFieldNames,
    'status'
  );

  const reviewFields = [
    ...reviewUserFields,
    ...statusFields,
    ...visibleFields
      .filter(field =>
        groupedFieldNames.indexOf(field.internalName) === -1 &&
        (
          hasAnyKeyword(field, DEFAULT_INTERNAL_WORKFLOW_KEYWORDS) ||
          isUserField(field)
        )
      )
      .map(field => field.internalName)
  ];

  reviewFields.forEach(fieldName => {
    if (groupedFieldNames.indexOf(fieldName) === -1) groupedFieldNames.push(fieldName);
  });

  const otherChoiceLookupFields = visibleFields
    .filter(field =>
      groupedFieldNames.indexOf(field.internalName) === -1 &&
      (isChoiceField(field) || isLookupField(field))
    )
    .map(field => field.internalName);

  otherChoiceLookupFields.forEach(fieldName => groupedFieldNames.push(fieldName));

  const otherFields = [
    ...otherChoiceLookupFields,
    ...visibleFields
      .filter(field => groupedFieldNames.indexOf(field.internalName) === -1)
      .map(field => field.internalName)
  ];

  const sections: ISectionConfig[] = [];

  addSectionIfNotEmpty(
    sections,
    'Requester / Student Information',
    'Basic requester, student, or employee information.',
    requesterFields
  );

  addSectionIfNotEmpty(
    sections,
    'Contact Information',
    'Email, phone, address, contact person, and related contact details.',
    contactFields
  );

  addSectionIfNotEmpty(
    sections,
    'Academic / Course Information',
    'Course, term, program, campus, and academic details.',
    academicFields
  );

  addSectionIfNotEmpty(
    sections,
    'Request Details',
    'Main request details, classification, department, priority, and supporting explanation.',
    requestFields
  );

  addSectionIfNotEmpty(
    sections,
    'Financial / Budget Information',
    'Budget, funding, cost, and finance-related fields.',
    financialFields
  );

  addSectionIfNotEmpty(
    sections,
    'Acknowledgement / Signature',
    'Acknowledgement, certification, date, and signature fields.',
    acknowledgementFields
  );

  addSectionIfNotEmpty(
    sections,
    'Review / Approval',
    'Reviewers, approvers, status, decisions, approval notes, and internal follow-up fields.',
    reviewFields
  );

  addSectionIfNotEmpty(
    sections,
    'Other Information',
    'Additional choice, lookup, and supporting fields from the SharePoint list.',
    otherFields
  );

  const labels: { [internalName: string]: string } = {};
  const helpText: { [internalName: string]: string } = {};
  const fieldConfig: { [internalName: string]: IFieldUiConfig } = {};
  const validation: { [internalName: string]: IValidationRule } = {};
  const transform: { [internalName: string]: TransformType } = {};

  visibleFields.forEach(field => {
    const lowerName = field.internalName.toLowerCase();

    labels[field.internalName] = createLabel(field);

    fieldConfig[field.internalName] = {
      width: shouldUseFullWidth(field) ? 'full' : 'half'
    };

    if (field.required) {
      validation[field.internalName] = {
        required: true,
        message: `${field.title} is required.`
      };
    }

    if (lowerName.indexOf('email') !== -1) {
      helpText[field.internalName] = 'Enter the email address that should receive updates.';
      fieldConfig[field.internalName].placeholder = 'name@frontrange.edu';
      transform[field.internalName] = 'lowercase';
    }

    if (lowerName.indexOf('phone') !== -1 || lowerName.indexOf('mobile') !== -1) {
      helpText[field.internalName] = 'Enter the best contact phone number.';
    }

    if (lowerName.indexOf('name') !== -1 || lowerName.indexOf('title') !== -1) {
      transform[field.internalName] = 'trim';
    }

    if (
      lowerName.indexOf('justification') !== -1 ||
      lowerName.indexOf('description') !== -1 ||
      lowerName.indexOf('reason') !== -1 ||
      lowerName.indexOf('details') !== -1
    ) {
      helpText[field.internalName] = 'Briefly explain the reason for this request.';
      fieldConfig[field.internalName].width = 'full';
    }

    if (isUserField(field)) {
      const bucket = classifyUserFieldBucket(field);

      if (bucket === 'review') {
        helpText[field.internalName] = 'Search for the reviewer, approver, or decision maker by name or email.';
      } else if (bucket === 'contact') {
        helpText[field.internalName] = 'Search for the contact person or owner by name or email.';
      } else if (bucket === 'requester') {
        helpText[field.internalName] = 'Search for the requester, student, employee, or submitter by name or email.';
      } else {
        helpText[field.internalName] = 'Search for a person by name or email.';
      }

      fieldConfig[field.internalName].placeholder = 'Enter a name or email address';
      fieldConfig[field.internalName].width = 'full';
    }

    if (isChoiceField(field) || isLookupField(field)) {
      helpText[field.internalName] = getChoiceOrLookupHelpText(field);
      fieldConfig[field.internalName].placeholder = getChoiceOrLookupPlaceholder(field);
    }

    if (field.typeAsString === 'Note') {
      fieldConfig[field.internalName].width = 'full';
    }
  });

  const orderedFieldNames = sections.reduce(
    (accumulator: string[], section) => accumulator.concat(section.fields),
    []
  );

  return {
    hiddenFields,
    sections,
    layout: {
      rows: createAutomaticRows(orderedFieldNames, fieldLookup)
    },
    labels,
    helpText,
    fields: fieldConfig,
    validation,
    transform,
    theme: {
      accentColor: '#005a9e'
    }
  };
};
