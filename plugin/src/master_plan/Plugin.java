package master_plan;

import com.vividsolutions.jump.feature.Feature;
import com.vividsolutions.jump.feature.FeatureCollection;
import com.vividsolutions.jump.workbench.model.Layer;
import com.vividsolutions.jump.workbench.plugin.AbstractPlugIn;
import com.vividsolutions.jump.workbench.plugin.PlugInContext;
import com.vividsolutions.jump.workbench.ui.plugin.FeatureInstaller;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.LineSegment;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class Plugin extends AbstractPlugIn {

    public Plugin() throws SQLException {
    }

    @Override
    public void initialize(PlugInContext context) throws Exception {
        FeatureInstaller featureInstaller = FeatureInstaller.getInstance(context.getWorkbenchContext()); // OpenJUMP >= 2.0
        featureInstaller.addMainMenuPlugin(
                this, //exe
                new String[]{"Master Plan", "Show Data"},
                this.getName(),
                false,
                null,
                null
        );
    }

    @Override
    public boolean execute(PlugInContext context) throws Exception {
        Database db = new Database();

        FeatureCollection prg = db.loadMap("prg");
        context.getLayerManager().addLayer("Master Plan", "prg", prg);

        FeatureCollection particelle = db.loadMap("particelle");
        context.getLayerManager().addLayer("Master Plan", "particelle", particelle);

        db.close();
        return false;
    }

    @Override
    public String getName() {
        return "Load Data";
    }
}