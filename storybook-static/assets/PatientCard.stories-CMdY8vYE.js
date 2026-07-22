import{i as e}from"./preload-helper-B45gAKPr.js";import{r as t,t as n}from"./toast.store-ke8shaUA.js";import{a as r,n as i,r as a,t as o}from"./PatientCard-LjSTkz_V.js";import{a as s,t as c}from"./modal.store-J_RWMlpw.js";var l,u,d,f,p,m;e((()=>{i(),a(),c(),n(),l={id:`p1`,name:`Ana García`,description:`Paciente de neurología con historial de migrañas crónicas.`,website:`https://example.com/ana`,avatar:`https://i.pravatar.cc/150?u=ana`,createdAt:`2024-01-15T10:30:00Z`},u={component:o,title:`Organisms/PatientCard`,tags:[`autodocs`],parameters:{zustandStore:[{store:r,state:{favoritePatientIds:[]}},{store:s,state:{isOpen:!1,mode:`create`,selectedPatientId:null}},{store:t,state:{toasts:[]}}]}},d={args:{patient:l}},f={args:{patient:l},parameters:{zustandStore:[{store:r,state:{favoritePatientIds:[`p1`]}},{store:s,state:{isOpen:!1,mode:`create`,selectedPatientId:null}},{store:t,state:{toasts:[]}}]}},p={args:{patient:{...l,website:``,avatar:``}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    patient: mockPatient
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    patient: mockPatient
  },
  parameters: {
    zustandStore: [{
      store: useFavoritesStore,
      state: {
        favoritePatientIds: ['p1']
      }
    }, {
      store: useModalStore,
      state: {
        isOpen: false,
        mode: 'create',
        selectedPatientId: null
      }
    }, {
      store: useToastStore,
      state: {
        toasts: []
      }
    }]
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    patient: {
      ...mockPatient,
      website: '',
      avatar: ''
    }
  }
}`,...p.parameters?.docs?.source}}},m=[`Default`,`IsFavorite`,`WithoutWebsite`]}))();export{d as Default,f as IsFavorite,p as WithoutWebsite,m as __namedExportsOrder,u as default};