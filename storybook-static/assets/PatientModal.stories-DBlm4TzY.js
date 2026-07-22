import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{n,t as r}from"./iframe-DzQCTUg_.js";import{n as i,t as a}from"./Button-3hvjmPh7.js";import{n as o,t as s}from"./Modal-Cq2-ye7E.js";import{r as c,t as l}from"./toast.store-ke8shaUA.js";import{a as u,i as d,n as f,o as p,r as m,s as h,t as g}from"./modal.store-J_RWMlpw.js";import{n as _,r as v,t as y}from"./patients.store-BJcSyEU8.js";import{n as b,t as x}from"./PatientForm-DmcwpUkx.js";function S(e){return e?{name:e.name,description:e.description,website:e.website,avatar:e.avatar}:{name:``,description:``,website:``,avatar:``}}function C(){let e=u(f),t=u(m),n=u(d),r=u(e=>e.closeModal),i=v(_(n)),o=v(e=>e.addPatient),l=v(e=>e.updatePatient),p=c(e=>e.showSuccess),g=c(e=>e.showError),y=(0,w.useMemo)(()=>S(t===`edit`?i:void 0),[t,i]),b=t===`create`,C=b?`Nuevo paciente`:`Editar paciente`,E=b?`Crear paciente`:`Guardar cambios`;function D(e){b?(o(e),p(`Paciente creado correctamente`),r()):i&&(l(i.id,e)?(p(`Cambios guardados`),r()):h(Error(`update failed`),{display:`toast`,context:`patient-update`,showToast:g}))}return(0,T.jsx)(s,{isOpen:e,onClose:r,title:C,ariaLabel:C,children:t===`edit`&&n&&!i?(0,T.jsxs)(`div`,{className:`flex flex-col items-center gap-4 py-8`,children:[(0,T.jsx)(`p`,{className:`text-text-muted text-sm`,children:`Paciente no encontrado`}),(0,T.jsx)(a,{variant:`secondary`,size:`sm`,onClick:r,"data-testid":`close-button`,children:`Cerrar`})]}):(0,T.jsx)(x,{mode:t,defaultValues:y,onSubmit:D,submitLabel:E})})}var w,T,E=t((()=>{w=e(n(),1),o(),b(),g(),y(),l(),p(),i(),T=r(),C.__docgenInfo={description:``,methods:[],displayName:`PatientModal`}})),D,O,k,A,j,M;t((()=>{E(),g(),y(),l(),D=[{id:`p1`,name:`Ana García`,description:`Paciente de neurología`,website:`https://example.com/ana`,avatar:`https://i.pravatar.cc/150?u=ana`,createdAt:`2024-01-15T10:30:00Z`}],O={component:C,title:`Organisms/PatientModal`,tags:[`autodocs`],parameters:{zustandStore:[{store:u,state:{isOpen:!0,mode:`create`,selectedPatientId:null}},{store:v,state:{patients:D,isLoading:!1,isLoadingMore:!1,hasMore:!1,currentPage:1,searchQuery:``,error:null}},{store:c,state:{toasts:[]}}]}},k={},A={parameters:{zustandStore:[{store:u,state:{isOpen:!0,mode:`edit`,selectedPatientId:`p1`}},{store:v,state:{patients:D,isLoading:!1,isLoadingMore:!1,hasMore:!1,currentPage:1,searchQuery:``,error:null}},{store:c,state:{toasts:[]}}]}},j={parameters:{zustandStore:[{store:u,state:{isOpen:!1,mode:`create`,selectedPatientId:null}},{store:v,state:{patients:D,isLoading:!1,isLoadingMore:!1,hasMore:!1,currentPage:1,searchQuery:``,error:null}},{store:c,state:{toasts:[]}}]}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: [{
      store: useModalStore,
      state: {
        isOpen: true,
        mode: 'edit',
        selectedPatientId: 'p1'
      }
    }, {
      store: usePatientsStore,
      state: {
        patients: mockPatients,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        currentPage: 1,
        searchQuery: '',
        error: null
      }
    }, {
      store: useToastStore,
      state: {
        toasts: []
      }
    }]
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: [{
      store: useModalStore,
      state: {
        isOpen: false,
        mode: 'create',
        selectedPatientId: null
      }
    }, {
      store: usePatientsStore,
      state: {
        patients: mockPatients,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        currentPage: 1,
        searchQuery: '',
        error: null
      }
    }, {
      store: useToastStore,
      state: {
        toasts: []
      }
    }]
  }
}`,...j.parameters?.docs?.source}}},M=[`Create`,`Edit`,`Closed`]}))();export{j as Closed,k as Create,A as Edit,M as __namedExportsOrder,O as default};