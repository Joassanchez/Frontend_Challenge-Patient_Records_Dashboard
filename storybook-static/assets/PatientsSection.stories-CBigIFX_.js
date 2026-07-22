import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{n,t as r}from"./iframe-DzQCTUg_.js";import{n as i,t as a}from"./cn-CwC4WeK_.js";import{n as o,t as s}from"./Spinner-tYurw-tl.js";import{n as c,t as l}from"./Button-3hvjmPh7.js";import{n as u,t as d}from"./EmptyState-B3-85CT5.js";import{n as f,t as p}from"./ErrorMessage-DC4-qZMi.js";import{n as m,t as h}from"./SearchInput-B5bZcXPU.js";import{n as g,t as _}from"./DashboardSection-rCQQ3RLa.js";import{r as v,t as y}from"./patients.store-BJcSyEU8.js";import{n as b,t as x}from"./PatientCardsGrid-5qu6Rleb.js";function S({className:e}){let t=(0,C.useRef)(!0),n=(0,C.useRef)(null),r=v(e=>e.patients),i=v(e=>e.isLoading),o=v(e=>e.isLoadingMore),c=v(e=>e.hasMore),u=v(e=>e.error),f=v(e=>e.loadPatients),m=v(e=>e.loadNextPatientsPage),[g,y]=(0,C.useState)(``);(0,C.useEffect)(()=>{let e=g.trim();if(t.current){t.current=!1,f(e);return}let n=window.setTimeout(()=>{f(e)},T);return()=>{window.clearTimeout(n)}},[g,f]);let b=!i&&!u,S=r.length>0,E=r.length,D=E===1?`1 registro encontrado`:`${E} registros encontrados`,O=b&&S?D:void 0,k=b?(0,w.jsx)(h,{value:g,onChange:y,placeholder:`Buscar por nombre o descripción`}):void 0;return(0,C.useEffect)(()=>{if(!b||!S||!c||o||typeof IntersectionObserver>`u`)return;let e=n.current;if(!e)return;let t=new IntersectionObserver(([e])=>{e.isIntersecting&&m()},{rootMargin:`160px`});return t.observe(e),()=>{t.disconnect()}},[b,S,c,o,m]),(0,w.jsxs)(_,{headingId:`patients-section-heading`,title:`Pacientes`,counter:O,actions:k,className:a(`w-full`,e),children:[i&&(0,w.jsx)(`div`,{className:`flex justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm`,children:(0,w.jsx)(s,{size:`lg`,color:`primary`})}),!i&&u&&(0,w.jsxs)(`div`,{className:`flex flex-col items-center gap-4 py-8`,children:[(0,w.jsx)(p,{message:u}),(0,w.jsx)(l,{variant:`secondary`,size:`sm`,onClick:()=>f(g.trim()),children:`Intentar de nuevo`})]}),b&&!S&&(0,w.jsx)(d,{icon:g.trim()?`search`:`user`,title:g.trim()?`No hay resultados`:`No hay pacientes cargados`,description:g.trim()?`No se encontraron pacientes para "${g.trim()}"`:`Creá tu primer paciente para empezar`}),b&&S&&(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(x,{patients:r,isLoading:!1}),c&&(0,w.jsx)(`div`,{ref:n,className:`mt-5 flex justify-center`,children:o&&(0,w.jsx)(s,{size:`md`,color:`primary`})})]})]})}var C,w,T,E=t((()=>{C=e(n(),1),i(),y(),u(),f(),m(),o(),c(),g(),b(),w=r(),T=300,S.__docgenInfo={description:``,methods:[],displayName:`PatientsSection`,props:{className:{required:!1,tsType:{name:`string`},description:``}}}})),D,O,k,A,j,M;t((()=>{E(),y(),D={component:S,title:`Organisms/PatientsSection`,tags:[`autodocs`],parameters:{zustandStore:{store:v,state:{patients:[{id:`p1`,name:`Ana García`,description:`Paciente de neurología con historial de migrañas crónicas.`,website:`https://example.com/ana`,avatar:`https://i.pravatar.cc/150?u=ana`,createdAt:`2024-01-15T10:30:00Z`},{id:`p2`,name:`Carlos Ruiz`,description:`Control rutinario de cardiología.`,website:`https://example.com/carlos`,avatar:`https://i.pravatar.cc/150?u=carlos`,createdAt:`2024-02-20T14:00:00Z`},{id:`p3`,name:`María López`,description:`Seguimiento post-operatorio.`,website:``,avatar:``,createdAt:`2024-03-10T09:15:00Z`}],isLoading:!1,isLoadingMore:!1,hasMore:!1,currentPage:1,searchQuery:``,error:null}}}},O={},k={parameters:{zustandStore:{store:v,state:{patients:[],isLoading:!0,isLoadingMore:!1,hasMore:!0,currentPage:0,searchQuery:``,error:null}}}},A={parameters:{zustandStore:{store:v,state:{patients:[],isLoading:!1,isLoadingMore:!1,hasMore:!0,currentPage:0,searchQuery:``,error:null}}}},j={parameters:{zustandStore:{store:v,state:{patients:[],isLoading:!1,isLoadingMore:!1,hasMore:!0,currentPage:0,searchQuery:``,error:`Failed to load patients. Please try again.`}}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: [],
        isLoading: true,
        isLoadingMore: false,
        hasMore: true,
        currentPage: 0,
        searchQuery: '',
        error: null
      }
    }
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        currentPage: 0,
        searchQuery: '',
        error: null
      }
    }
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: {
      store: usePatientsStore,
      state: {
        patients: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        currentPage: 0,
        searchQuery: '',
        error: 'Failed to load patients. Please try again.'
      }
    }
  }
}`,...j.parameters?.docs?.source}}},M=[`WithPatients`,`Loading`,`Empty`,`WithError`]}))();export{A as Empty,k as Loading,j as WithError,O as WithPatients,M as __namedExportsOrder,D as default};