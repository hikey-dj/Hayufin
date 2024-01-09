import React, { useState } from 'react';
import Select from 'react-select'

const Dropdown = (props) => {
  const {name,options,selectedOption,defaultt, setSelectedOption} = props;
  
  let Options =[];
  options.map((option) => {
    Options.push({value : option , label: option})
  })

  const dropdownStyle = {
    // Add your custom styles here
    backgroundColor: '#f0f0f0', // Example background color
    color: '#333', // Example text color
    borderRadius: '5px', // Example border radius
    padding: '5px', 
    minWidth: '200px'
    // Add more styles as needed
  };

  // Event handler for option change
  const handleOptionChange = (event) => {
    setSelectedOption(event.label);
  };

  return (
    <div>
      <Select options = {Options} onChange={handleOptionChange} className='drop'
        styles = {{
          control: (baseStyles,state) => ({
            ...baseStyles,
            fontSize: '20px',
          }),
          option: (base) => ({
            ...base,
            fontSize: '20px',
            padding : '10px',
          })
        }}
        defaultValue={{value: defaultt,label:defaultt}}
      />
      <label htmlFor="dropdown" className='dropdown--text'>Select {name}:  </label>        
    </div>
  );
};

export default Dropdown;
