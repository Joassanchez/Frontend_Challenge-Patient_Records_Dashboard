import{i as e}from"./preload-helper-B45gAKPr.js";import{r as t,t as n}from"./toast.store-ke8shaUA.js";import{n as r,t as i}from"./ToastContainer-CQ-YHId9.js";var a,o,s,c,l,u;e((()=>{r(),n(),a=[{id:`t1`,type:`success`,message:`Patient saved successfully`,createdAt:Date.now()},{id:`t2`,type:`info`,message:`Loading patient records...`,createdAt:Date.now()},{id:`t3`,type:`error`,message:`Failed to connect to server`,createdAt:Date.now()}],o={component:i,title:`Organisms/ToastContainer`,tags:[`autodocs`],parameters:{zustandStore:{store:t,state:{toasts:a}}}},s={},c={parameters:{zustandStore:{store:t,state:{toasts:[a[0]]}}}},l={parameters:{zustandStore:{store:t,state:{toasts:[]}}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: {
      store: useToastStore,
      state: {
        toasts: [mockToasts[0]]
      }
    }
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  parameters: {
    zustandStore: {
      store: useToastStore,
      state: {
        toasts: []
      }
    }
  }
}`,...l.parameters?.docs?.source}}},u=[`WithToasts`,`SingleToast`,`Empty`]}))();export{l as Empty,c as SingleToast,s as WithToasts,u as __namedExportsOrder,o as default};