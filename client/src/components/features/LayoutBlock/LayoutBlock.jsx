import PropTypes from "prop-types";

const LayoutBlock = ({width = "100%", height="100%", type = "row", children}) => {
    return ( 
        <div className={`layout__${type}`}  style={{  width : width, height : height}}>
            {children}
        </div>
    );
}

LayoutBlock.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    type: PropTypes.oneOf(["row", "col"]),
    children: PropTypes.node.isRequired,
};

export default LayoutBlock;