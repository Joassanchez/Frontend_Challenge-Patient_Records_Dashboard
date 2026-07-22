import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./iframe-DzQCTUg_.js";import{n,t as r}from"./Toast-DTxyF8xW.js";var i,a,o,s,c,l,u,d,f;e((()=>{n(),i=t(),a={component:r,title:`Atoms/Toast`,tags:[`autodocs`],decorators:[e=>(0,i.jsx)(`div`,{style:{padding:`1rem`,maxWidth:`400px`},children:(0,i.jsx)(e,{})})]},o={id:`toast-1`,type:`info`,message:`This is an informational message`,createdAt:Date.now()},s={args:{toast:{...o,type:`info`,message:`Patient record updated`},onDismiss:()=>{}}},c={args:{toast:{...o,type:`success`,message:`Patient saved successfully`},onDismiss:()=>{}}},l={args:{toast:{...o,type:`error`,message:`Failed to load patient data`},onDismiss:()=>{}}},u={args:{toast:{...o,type:`warning`,message:`Session expiring soon`},onDismiss:()=>{}}},d={args:{toast:{...o,type:`success`,message:`Changes saved`},onDismiss:e=>console.log(`Dismissed:`,e)}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      ...baseToast,
      type: 'info',
      message: 'Patient record updated'
    },
    onDismiss: () => {}
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      ...baseToast,
      type: 'success',
      message: 'Patient saved successfully'
    },
    onDismiss: () => {}
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      ...baseToast,
      type: 'error',
      message: 'Failed to load patient data'
    },
    onDismiss: () => {}
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      ...baseToast,
      type: 'warning',
      message: 'Session expiring soon'
    },
    onDismiss: () => {}
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      ...baseToast,
      type: 'success',
      message: 'Changes saved'
    },
    onDismiss: (id: string) => console.log('Dismissed:', id)
  }
}`,...d.parameters?.docs?.source}}},f=[`Info`,`Success`,`Error`,`Warning`,`WithAction`]}))();export{l as Error,s as Info,c as Success,u as Warning,d as WithAction,f as __namedExportsOrder,a as default};