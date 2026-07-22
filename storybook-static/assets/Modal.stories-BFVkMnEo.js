import{i as e}from"./preload-helper-B45gAKPr.js";import{t}from"./iframe-DzQCTUg_.js";import{n,t as r}from"./Modal-Cq2-ye7E.js";var i,a,o,s,c,l,u;e((()=>{n(),i=t(),a={component:r,title:`Molecules/Modal`,tags:[`autodocs`]},o={args:{isOpen:!0,onClose:()=>{},title:`Edit Patient`,ariaLabel:`Edit patient dialog`,children:(0,i.jsxs)(`div`,{className:`space-y-4`,children:[(0,i.jsx)(`p`,{children:`Modal content goes here.`}),(0,i.jsx)(`p`,{children:`This modal uses motion/react for animations.`})]})}},s={args:{isOpen:!0,onClose:()=>{},title:`Confirm Delete`,ariaLabel:`Confirm delete dialog`,children:(0,i.jsxs)(`div`,{className:`flex flex-col gap-4`,children:[(0,i.jsx)(`p`,{children:`Are you sure you want to delete this patient?`}),(0,i.jsxs)(`div`,{className:`flex justify-end gap-2`,children:[(0,i.jsx)(`button`,{type:`button`,className:`rounded-md border border-slate-200 px-4 py-2 text-sm`,onClick:()=>{},children:`Cancel`}),(0,i.jsx)(`button`,{type:`button`,className:`rounded-md bg-error px-4 py-2 text-sm text-white`,onClick:()=>{},children:`Delete`})]})]})}},c={args:{isOpen:!0,onClose:()=>{},title:`Patient Details`,ariaLabel:`Patient details dialog`,children:(0,i.jsx)(`div`,{className:`space-y-4`,children:Array.from({length:20},(e,t)=>(0,i.jsx)(`p`,{children:`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`},t))})}},l={args:{isOpen:!1,onClose:()=>{},title:`Hidden Modal`,ariaLabel:`Hidden dialog`,children:(0,i.jsx)(`p`,{children:`This should not be visible`})}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Edit Patient',
    ariaLabel: 'Edit patient dialog',
    children: <div className="space-y-4">\r
        <p>Modal content goes here.</p>\r
        <p>This modal uses motion/react for animations.</p>\r
      </div>
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Confirm Delete',
    ariaLabel: 'Confirm delete dialog',
    children: <div className="flex flex-col gap-4">\r
        <p>Are you sure you want to delete this patient?</p>\r
        <div className="flex justify-end gap-2">\r
          <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm" onClick={() => {}}>\r
            Cancel\r
          </button>\r
          <button type="button" className="rounded-md bg-error px-4 py-2 text-sm text-white" onClick={() => {}}>\r
            Delete\r
          </button>\r
        </div>\r
      </div>
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Patient Details',
    ariaLabel: 'Patient details dialog',
    children: <div className="space-y-4">\r
        {Array.from({
        length: 20
      }, (_, i) => <p key={i}>\r
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do\r
            eiusmod tempor incididunt ut labore et dolore magna aliqua.\r
          </p>)}\r
      </div>
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Hidden Modal',
    ariaLabel: 'Hidden dialog',
    children: <p>This should not be visible</p>
  }
}`,...l.parameters?.docs?.source}}},u=[`Open`,`WithActions`,`ScrollableContent`,`Closed`]}))();export{l as Closed,o as Open,c as ScrollableContent,s as WithActions,u as __namedExportsOrder,a as default};