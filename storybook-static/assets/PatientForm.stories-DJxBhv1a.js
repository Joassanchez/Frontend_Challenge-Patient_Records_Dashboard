import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./PatientForm-DmcwpUkx.js";var r,i,a,o,s,c;e((()=>{t(),r={component:n,title:`Organisms/PatientForm`,tags:[`autodocs`],argTypes:{mode:{control:`select`,options:[`create`,`edit`]}}},i={name:``,description:``,website:``,avatar:``},a={name:`Ana García`,description:`Paciente de neurología`,website:`https://example.com/ana`,avatar:`https://i.pravatar.cc/150?u=ana`},o={args:{mode:`create`,defaultValues:i,onSubmit:e=>console.log(`Create:`,e),submitLabel:`Create patient`}},s={args:{mode:`edit`,defaultValues:a,onSubmit:e=>console.log(`Edit:`,e),submitLabel:`Save changes`}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'create',
    defaultValues: emptyDefaults,
    onSubmit: (data: PatientFormData) => console.log('Create:', data),
    submitLabel: 'Create patient'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'edit',
    defaultValues: editDefaults,
    onSubmit: (data: PatientFormData) => console.log('Edit:', data),
    submitLabel: 'Save changes'
  }
}`,...s.parameters?.docs?.source}}},c=[`Create`,`Edit`]}))();export{o as Create,s as Edit,c as __namedExportsOrder,r as default};