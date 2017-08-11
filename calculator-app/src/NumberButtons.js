import React, { Component } from 'react'
import { Button, Table, Menu, Label, Container } from 'semantic-ui-react'

class NumberButtons extends Component {

	render(){
		var numArray = ['0','1','2','3','4','5','6','7','8','9']
		var numButtons = numArray.map((el) => {	return <Table.Cell>{el}</Table.Cell> })
		return(
			<Table celled>
				<Table.Body>
					<Container>
						<Table.Row>
							<Table.Cell><Button size="massive" value="7">7</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="8">8</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="9">9</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="*">*</Button></Table.Cell>
						</Table.Row>
					</Container>
					<Container>
						<Table.Row>
							<Table.Cell><Button size="massive" value="4">4</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="5">5</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="6">6</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="/">/</Button></Table.Cell>
						</Table.Row>
					</Container>
					<Container>
						<Table.Row>
							<Table.Cell><Button size="massive" value="1">1</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="2">2</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="3">3</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="+">+</Button></Table.Cell>
						</Table.Row>
					</Container>
					<Container>
						<Table.Row>
							<Table.Cell><Button size="massive symbol" value="," >,</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="0" center>0</Button></Table.Cell>
							<Table.Cell><Button size="massive symbol" value="." center>.</Button></Table.Cell>
							<Table.Cell><Button size="massive" value="-">-</Button></Table.Cell>
						</Table.Row>
						<Table.Footer>
							<Table.Row>
								<Table.Cell><Button size="massive" value="=">=</Button></Table.Cell>
							</Table.Row>
						</Table.Footer>
					</Container>
				</Table.Body>
			</Table>
		)
	}
}

export default NumberButtons