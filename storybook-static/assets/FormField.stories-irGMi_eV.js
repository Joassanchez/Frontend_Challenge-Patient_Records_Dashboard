import{c as e,i as t}from"./preload-helper-B45gAKPr.js";import{n,t as r}from"./iframe-DzQCTUg_.js";import{n as i,t as a}from"./cn-CwC4WeK_.js";import{n as o,t as s}from"./Input-jJ72p1Us.js";import{n as c,t as l}from"./Label-7rfhsiZx.js";import{n as u,t as d}from"./ErrorMessage-DC4-qZMi.js";function f({label:e,htmlFor:t,error:n,required:r,children:i}){let o=n?`${t}-error`:void 0,s=(0,p.cloneElement)(i,{"aria-invalid":n?`true`:void 0,...o?{"aria-describedby":o}:{}});return(0,m.jsxs)(`div`,{className:a(`flex flex-col gap-1.5`),children:[(0,m.jsx)(l,{htmlFor:t,required:r,children:e}),s,n&&(0,m.jsx)(d,{message:n,id:o})]})}var p,m,h=t((()=>{p=e(n(),1),i(),c(),u(),m=r(),f.__docgenInfo={description:``,methods:[],displayName:`FormField`,props:{label:{required:!0,tsType:{name:`string`},description:``},htmlFor:{required:!0,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},required:{required:!1,tsType:{name:`boolean`},description:``},children:{required:!0,tsType:{name:`ReactElement`,elements:[{name:`Pick`,elements:[{name:`InputHTMLAttributes`,elements:[{name:`HTMLInputElement`}],raw:`InputHTMLAttributes<HTMLInputElement>`},{name:`union`,raw:`'aria-invalid' | 'aria-describedby'`,elements:[{name:`literal`,value:`'aria-invalid'`},{name:`literal`,value:`'aria-describedby'`}]}],raw:`Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-invalid' | 'aria-describedby'
>`}],raw:`ReactElement<FormFieldChildProps>`},description:``}}}})),g,_,v,y,b,x;t((()=>{h(),o(),g=r(),_={component:f,title:`Molecules/FormField`,tags:[`autodocs`]},v={args:{label:`Full Name`,htmlFor:`name`,children:(0,g.jsx)(s,{id:`name`,placeholder:`Enter name`})}},y={args:{label:`Email`,htmlFor:`email`,error:`Please enter a valid email address`,required:!0,children:(0,g.jsx)(s,{id:`email`,type:`email`,placeholder:`email@example.com`})}},b={args:{label:`Phone`,htmlFor:`phone`,required:!0,children:(0,g.jsx)(s,{id:`phone`,type:`tel`,placeholder:`+54 11 1234-5678`})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Full Name',
    htmlFor: 'name',
    children: <Input id="name" placeholder="Enter name" />
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    htmlFor: 'email',
    error: 'Please enter a valid email address',
    required: true,
    children: <Input id="email" type="email" placeholder="email@example.com" />
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Phone',
    htmlFor: 'phone',
    required: true,
    children: <Input id="phone" type="tel" placeholder="+54 11 1234-5678" />
  }
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithError`,`WithHelpText`]}))();export{v as Default,y as WithError,b as WithHelpText,x as __namedExportsOrder,_ as default};