import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
html,body{
  background: #282828;
}
input[type=number]::-webkit-inner-spin-button {
  opacity: 0;
}
input[type=number]:hover::-webkit-inner-spin-button,
input[type=number]:focus::-webkit-inner-spin-button {
  opacity: 0.25;
}
/* width */
::-webkit-scrollbar {
  width: 15px;
}
/* Track */
::-webkit-scrollbar-track {
  background: #2d313c;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background: #5b5f67;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #5b5f67;
}
.ant-slider-track, .ant-slider:hover .ant-slider-track {
  background-color: #FFA910;
  opacity: 0.75;
}
.ant-slider-track,
.ant-slider ant-slider-track:hover {
  background-color: #FFA910;
  opacity: 0.75;
}
.ant-slider-dot-active,
.ant-slider-handle,
.ant-slider-handle-click-focused,
.ant-slider:hover .ant-slider-handle:not(.ant-tooltip-open)  {
  border: 2px solid #FFA910; 
}
.ant-table-tbody > tr.ant-table-row:hover > td {
  background: #282828;
}
.ant-table-tbody > tr > td {
  border-bottom: 8px solid #313131;
}
.ant-table-container table > thead > tr:first-child th {
  border-bottom: none;
}
.ant-divider-horizontal.ant-divider-with-text::before, .ant-divider-horizontal.ant-divider-with-text::after {
  border-top: 1px solid #FFFFFF !important;
}
.ant-layout {
    background: #282828
  }
  .ant-table {
    background: #282828;
  }
  .ant-table-thead > tr > th {
    background: #313131;
  }
.ant-select-item-option-content {
  img {
    margin-right: 4px;
  }
}
.ant-modal-content {
  background-color: #282828;
}

@-webkit-keyframes highlight {
  from { background-color: #FFA910;}
  to {background-color: #313131;}
}
@-moz-keyframes highlight {
  from { background-color: #FFA910;}
  to {background-color: #313131;}
}
@-keyframes highlight {
  from { background-color: #FFA910;}
  to {background-color: #313131;}
}
.flash {
  -moz-animation: highlight 0.5s ease 0s 1 alternate ;
  -webkit-animation: highlight 0.5s ease 0s 1 alternate;
  animation: highlight 0.5s ease 0s 1 alternate;
}
.ant-card-grid{
webkit-box-shadow :0px;
box-shadow: 0px;
}
.ant-card-head{
  max-height: 85px;
}
.lookLikeLink:hover{
  text-decoration: underline;
  cursor: pointer;
}
.lookLikeLink{
  color: #FFA910;

}
`;
