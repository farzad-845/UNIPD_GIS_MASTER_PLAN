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
    String connection = "jdbc:postgresql://localhost:5432/gisdb";

    public Plugin() throws SQLException {
    }

    @Override
    public void initialize(PlugInContext context) throws Exception {
        FeatureInstaller featureInstaller = FeatureInstaller.getInstance(context.getWorkbenchContext()); // OpenJUMP >= 2.0
        featureInstaller.addMainMenuPlugin(
                this, //exe
                new String[]{"GIS", "LAB 04"},
                this.getName(),
                false,
                null,
                null);
    }

    @Override
    public boolean execute(PlugInContext context) throws Exception {
        String input_layer = "";
        Layer input_layer_obj = context.getLayerManager().getLayer(input_layer);

        for (Feature feature : input_layer_obj.getFeatureCollectionWrapper().getFeatures()) {
            String id = feature.getAttribute("Numero").toString();
        }


        return false;
    }

    public List<Feature> checkCross(Geometry g, FeatureCollection fc) {
        Coordinate[] arcr = g.getCoordinates();
        List<Feature> list = fc.getFeatures();
        List<Feature> result = new ArrayList<Feature>();
        for (Feature f : list) {
            boolean cross = false;
            Geometry geom = f.getGeometry();
            check_cross:
            for (int i = 1; i < arcr.length; i++) {
                LineSegment lsr = new LineSegment(arcr[i - 1], arcr[i]);
                Coordinate[] arcg = geom.getCoordinates();
                for (int ii = 1; ii < arcg.length; ii++) {
                    LineSegment lsg = new LineSegment(arcg[ii - 1], arcg[ii]);
                    if (lsg.distance(lsr) == 0) {
                        result.add(f);
                        break check_cross;
                    }
                }
            }
        }
        return result;
    }

    @Override
    public String getName() {
        return "JDBC Postgres Connection";
    }
}