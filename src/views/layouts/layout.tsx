import { FunctionComponent } from "https://esm.sh/v96/preact@10.11.2/src/index.d.ts";
const Layout: FunctionComponent = ({ children }) => (
	<html lang="en">
		<head></head>
		<body>
			{ children }
		</body>
	</html>
);

export default Layout;