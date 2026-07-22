import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{n,t as r}from"./iframe-DzQCTUg_.js";import{n as i,t as a}from"./cn-CwC4WeK_.js";import{n as o,t as s}from"./Button-3hvjmPh7.js";import{n as c,t as l}from"./EmptyState-B3-85CT5.js";import{n as u,t as d}from"./DashboardSection-rCQQ3RLa.js";import{a as f,i as p,r as m}from"./PatientCard-LjSTkz_V.js";import{r as h,t as g}from"./patients.store-BJcSyEU8.js";import{n as _,t as v}from"./PatientCardsGrid-5qu6Rleb.js";function y({className:e}){let[t,n]=(0,b.useState)(1),r=f(p),i=h(e=>e.patients),o=i.filter(e=>r.includes(e.id)),c=i.length>0,u=o.length===1?`1 paciente guardado`:`${o.length} pacientes guardados`,m=Math.max(1,Math.ceil(o.length/S)),g=Math.min(t,m),_=(g-1)*S,y=o.slice(_,_+S);return(0,x.jsxs)(d,{headingId:`favorites-section-heading`,title:`Favoritos`,counter:u,className:a(`w-full`,e),children:[r.length===0&&(0,x.jsx)(l,{icon:`inbox`,title:`Todavía no marcaste favoritos`,description:`Guardá pacientes importantes para accederlos más rápido`,variant:`compact`}),r.length>0&&o.length===0&&(0,x.jsx)(l,{icon:`inbox`,title:c?`Algunos favoritos ya no están disponibles`:`Tus favoritos aparecerán acá`,description:c?`Los pacientes guardados ya no existen en la lista actual`:`Tus favoritos aparecerán cuando la lista de pacientes esté disponible`,variant:`compact`}),r.length>0&&o.length>0&&(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(v,{patients:y,isLoading:!1}),m>1&&(0,x.jsxs)(`nav`,{"aria-label":`Paginación de favoritos`,className:`mt-4 flex flex-wrap items-center justify-center gap-3`,children:[(0,x.jsx)(s,{variant:`secondary`,size:`sm`,disabled:g===1,className:`rounded-full disabled:bg-slate-50`,onClick:()=>n(e=>e-1),children:`Anterior`}),(0,x.jsxs)(`span`,{"aria-live":`polite`,className:`text-sm font-medium text-slate-500`,children:[`Página `,g,` de `,m]}),(0,x.jsx)(s,{variant:`secondary`,size:`sm`,disabled:g===m,className:`rounded-full disabled:bg-slate-50`,onClick:()=>n(e=>e+1),children:`Siguiente`})]})]})]})}var b,x,S,C=t((()=>{b=e(n(),1),i(),o(),m(),g(),c(),u(),_(),x=r(),S=3,y.__docgenInfo={description:``,methods:[],displayName:`FavoritesSection`,props:{className:{required:!1,tsType:{name:`string`},description:``}}}})),w,T,E,D,O;t((()=>{C(),g(),m(),w=[{id:`p1`,name:`Ana García`,description:`Paciente de neurología.`,website:`https://example.com/ana`,avatar:`https://i.pravatar.cc/150?u=ana`,createdAt:`2024-01-15T10:30:00Z`},{id:`p2`,name:`Carlos Ruiz`,description:`Control rutinario de cardiología.`,website:`https://example.com/carlos`,avatar:`https://i.pravatar.cc/150?u=carlos`,createdAt:`2024-02-20T14:00:00Z`},{id:`p3`,name:`María López`,description:`Seguimiento post-operatorio.`,website:``,avatar:``,createdAt:`2024-03-10T09:15:00Z`}],T={component:y,title:`Organisms/FavoritesSection`,tags:[`autodocs`],parameters:{zustandStore:[{store:h,state:{patients:w,isLoading:!1,isLoadingMore:!1,hasMore:!1,currentPage:1,searchQuery:``,error:null}},{store:f,state:{favoritePatientIds:[`p1`,`p3`]}}]}},E={},D={parameters:{zustandStore:[{store:h,state:{patients:w,isLoading:!1,isLoadingMore:!1,hasMore:!1,currentPage:1,searchQuery:``,error:null}},{store:f,state:{favoritePatientIds:[]}}]}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: [{
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
      store: useFavoritesStore,
      state: {
        favoritePatientIds: []
      }
    }]
  }
}`,...D.parameters?.docs?.source}}},O=[`WithFavorites`,`Empty`]}))();export{D as Empty,E as WithFavorites,O as __namedExportsOrder,T as default};