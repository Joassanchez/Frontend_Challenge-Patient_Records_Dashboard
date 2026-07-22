import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./EmptyState-B3-85CT5.js";var r,i,a,o,s,c;e((()=>{t(),r={component:n,title:`Molecules/EmptyState`,tags:[`autodocs`],argTypes:{icon:{control:`select`,options:[`search`,`inbox`,`user`,`alert-circle`]},variant:{control:`select`,options:[`default`,`compact`]}}},i={args:{title:`No patients found`,description:`Try adjusting your search criteria`,icon:`search`}},a={args:{title:`No favorites yet`,description:`Mark patients as favorites to see them here`,icon:`inbox`}},o={args:{title:`No patients loaded`,description:`Create your first patient to get started`,icon:`user`,action:{label:`Add patient`,onClick:()=>alert(`Add patient clicked`)}}},s={args:{title:`No results`,description:`No matching records`,icon:`search`,variant:`compact`}},i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No patients found',
    description: 'Try adjusting your search criteria',
    icon: 'search'
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No favorites yet',
    description: 'Mark patients as favorites to see them here',
    icon: 'inbox'
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No patients loaded',
    description: 'Create your first patient to get started',
    icon: 'user',
    action: {
      label: 'Add patient',
      onClick: () => alert('Add patient clicked')
    }
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'No results',
    description: 'No matching records',
    icon: 'search',
    variant: 'compact'
  }
}`,...s.parameters?.docs?.source}}},c=[`Default`,`WithCustomMessage`,`WithAction`,`Compact`]}))();export{s as Compact,i as Default,o as WithAction,a as WithCustomMessage,c as __namedExportsOrder,r as default};