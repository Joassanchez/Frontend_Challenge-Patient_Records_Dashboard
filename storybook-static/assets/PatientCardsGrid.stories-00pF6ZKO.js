import{i as e}from"./preload-helper-B45gAKPr.js";import{n as t,t as n}from"./PatientCardsGrid-5qu6Rleb.js";var r,i,a,o,s,c,l;e((()=>{t(),r=[{id:`p1`,name:`Ana García`,description:`Paciente de neurología con historial de migrañas crónicas.`,website:`https://example.com/ana`,avatar:`https://i.pravatar.cc/150?u=ana`,createdAt:`2024-01-15T10:30:00Z`},{id:`p2`,name:`Carlos Ruiz`,description:`Control rutinario de cardiología.`,website:`https://example.com/carlos`,avatar:`https://i.pravatar.cc/150?u=carlos`,createdAt:`2024-02-20T14:00:00Z`},{id:`p3`,name:`María López`,description:`Seguimiento post-operatorio.`,website:``,avatar:``,createdAt:`2024-03-10T09:15:00Z`}],i={component:n,title:`Organisms/PatientCardsGrid`,tags:[`autodocs`]},a={args:{patients:r,isLoading:!1}},o={args:{patients:[],isLoading:!0}},s={args:{patients:[],isLoading:!1}},c={args:{patients:[r[0]],isLoading:!1}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    patients: mockPatients,
    isLoading: false
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    patients: [],
    isLoading: true
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    patients: [],
    isLoading: false
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    patients: [mockPatients[0]],
    isLoading: false
  }
}`,...c.parameters?.docs?.source}}},l=[`Default`,`Loading`,`Empty`,`SinglePatient`]}))();export{a as Default,s as Empty,o as Loading,c as SinglePatient,l as __namedExportsOrder,i as default};